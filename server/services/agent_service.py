"""LangGraph AI Agent for travel sales conversations"""
import json
import os
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
import operator
from sqlalchemy.orm import Session
from services.search_service import SearchService
from services.booking_service import BookingService
from config import get_settings

settings = get_settings()

# Set up LangSmith tracing if enabled
if settings.langsmith_tracing.lower() == "true" and settings.langsmith_api_key:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
    os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project

# System prompt for the sales agent
AGENT_SYSTEM_PROMPT = """Kamu adalah agen penjualan tour & travel profesional yang ramah dan membantu.

KEPRIBADIAN:
- Antusias dan berpengetahuan tentang destinasi wisata
- Membantu dan konsultatif (tidak memaksa)
- Gunakan emoji dengan bijak untuk kehangatan ✈️ 🌍
- Berbicara dalam Bahasa Indonesia atau Inggris sesuai preferensi user

TUJUAN KAMU:
1. Memahami preferensi perjalanan customer
2. Merekomendasikan paket yang relevan menggunakan tool search
3. Menjawab pertanyaan tentang paket secara detail
4. Memandu customer yang tertarik melalui proses booking

TOOLS YANG TERSEDIA:
- search_packages: Cari paket tour berdasarkan query user
- create_booking: Buat booking setelah mengumpulkan data customer

RULES KHUSUS (WAJIB DIPATUHI):
1. **PENCARIAN AKTIF**: Jika user menyebutkan destinasi (contoh: "Jepang", "Bali"), LANSUNG panggil `search_packages` sebelum bertanya detail lainnya. Jangan tanya musim/aktivitas dulu jika sudah ada kata kunci destinasi.
2. **ANTI-HALUSINASI**: HANYA boleh merekomendasikan paket yang dikembalikan oleh tool `search_packages`. DILARANG KERAS mengarang/membuat-buat paket sendiri atau menggabungkan nama paket. Jika hasil search hanya 1, tampilkan 1 saja.
3. **LINK WHATSAPP**: Saat booking berhasil, tool `create_booking` akan mengembalikan sebuah URL. Kamu WAJIB menggunakan URL tersebut persis apa adanya. DILARANG membuat link wa.me sendiri menggunakan nomor user. Link dari tool sudah berisi format pesan yang benar ke nomor perusahaan.
4. **JANGAN TAMPILKAN ID**: ID paket (UUID) adalah untuk keperluan internal sistem. JANGAN PERNAH menampilkannya kepada user. Gunakan Nama Paket untuk referensi.
5. **RELEVANSI KETAT**: Jika user meminta spesifik (misal "Jepang"), JANGAN menawarkan paket lain (misal "Bali") kecuali hasil search kosong atau user meminta alternatif. Filter hasil search yang tidak sesuai dengan request utama user.

ALUR PERCAKAPAN:
1. Jika user menyapa tanpa konteks -> Sapa balik dan tanya rencana liburan.
2. Jika user menyebut destinasi -> LANSUNG Search.
3. Presentasikan hasil search (Nama Paket, Harga, Highlights). JANGAN sebutkan ID.
4. Jawab pertanyaan user.
5. Jika user minat -> Tanya: "Apakah Anda ingin booking paket [NAMA PAKET] ini?"
6. Minta data berikut (WAJIB LENGKAP):
   - Jumlah Peserta (Pax)
7. **EKSEKUSI LANGSUNG**: Segera SETELAH mendapatkan ketiga data di atas, KAMU HARUS LANGSUNG memanggil tool `create_booking`.
   - JANGAN berkata "Baik saya akan proses" lalu berhenti.
   - JANGAN berkata "Mohon tunggu" tanpa memanggil tool.
   - Tindakan "memproses" ADALAH memanggil tool itu sendiri.
8. Tampilkan konfirmasi dan Link WhatsApp dari output tool dalam format Markdown: `[Klik untuk Lanjut ke WhatsApp](url_dari_tool)`.

JANGAN PERNAH MENYEBUT "tools", "function", atau "JSON" kepada user.
"""

# Global database session holder (will be set per request)
_db_session = None


def set_db_session(db: Session):
    """Set the database session for the current request"""
    global _db_session
    _db_session = db


@tool
def search_packages(query: str, max_results: int = 3) -> str:
    """Cari paket tour berdasarkan query user.
    
    Args:
        query: Query pencarian (destinasi, aktivitas, musim)
        max_results: Jumlah maksimal hasil yang dikembalikan
        
    Returns:
        JSON string dari paket yang cocok
    """
    if not _db_session:
        return json.dumps({"error": "Database session not available"}, ensure_ascii=False)
    
    search_service = SearchService(_db_session)
    results = search_service.search_hybrid(query, limit=max_results)
    results_dict = [pkg.to_dict() for pkg in results]
    return json.dumps(results_dict, ensure_ascii=False)


@tool
def create_booking(
    package_id: str,
    customer_name: str,
    whatsapp_number: str,
    num_travelers: int
) -> str:
    """Buat booking baru dan generate link WhatsApp.
    
    Args:
        package_id: ID paket yang akan di-booking
        customer_name: Nama lengkap customer (nama depan dan belakang)
        whatsapp_number: Nomor WhatsApp dengan kode negara (contoh: +6281234567890)
        num_travelers: Jumlah traveler (WAJIB)
        
    Returns:
        JSON string containing the OFFICIAL WhatsApp link. 
        Agent MUST use the 'whatsapp_link' from this JSON response.
        DO NOT generate your own link.
    """
    if not _db_session:
        return json.dumps({"error": "Database session not available"}, ensure_ascii=False)
    
    try:
        booking_service = BookingService(_db_session)
        result = booking_service.create_booking(
            package_id=package_id,
            customer_name=customer_name,
            whatsapp_number=whatsapp_number,
            num_travelers=num_travelers
        )
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"error": str(e)}, ensure_ascii=False)


# Initialize LLM with OpenRouter
llm = ChatOpenAI(
    model="google/gemini-2.5-flash-lite",  # Using free Gemini model via OpenRouter
    temperature=0,
    max_tokens=10000,
    openai_api_key=settings.openrouter_api_key,
    openai_api_base="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "UpRev AI Sales Agent",
    }
)

# Bind tools to LLM
tools = [search_packages, create_booking]
llm_with_tools = llm.bind_tools(tools)


# Define agent state
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]


# Define agent node
def agent_node(state: AgentState):
    """Agent reasoning node"""
    messages = state["messages"]
    
    # Add system message if first turn
    if len(messages) == 1 or not any(isinstance(m, HumanMessage) and AGENT_SYSTEM_PROMPT in m.content for m in messages):
        # Prepend system prompt to first user message
        first_msg = messages[0]
        if isinstance(first_msg, HumanMessage):
            system_msg = HumanMessage(content=AGENT_SYSTEM_PROMPT + "\n\nUser: " + first_msg.content)
            messages = [system_msg] + list(messages[1:])
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


# Define conditional edge function
def should_continue(state: AgentState):
    """Determine if we should continue to tools or end"""
    last_message = state["messages"][-1]
    
    # If there are tool calls, continue to tools
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    # Otherwise end
    return END


# Create the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

# Set entry point
workflow.set_entry_point("agent")

# Add conditional edges
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)

# Add edge from tools back to agent
workflow.add_edge("tools", "agent")

# Compile with memory
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)


def chat(user_message: str, thread_id: str, db: Session) -> dict:
    """Process user message and return agent response
    
    Args:
        user_message: The user's message
        thread_id: Thread ID for conversation persistence
        db: Database session
        
    Returns:
        Dict with 'content' and 'tool_calls'
    """
    # Set database session for tools
    set_db_session(db)
    
    # Create config with thread_id for conversation persistence
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        # Invoke the graph
        result = app.invoke(
            {"messages": [HumanMessage(content=user_message)]},
            config=config
        )
        
        # Extract last message
        last_message = result["messages"][-1]
        
        return {
            "content": last_message.content,
            "tool_calls": getattr(last_message, "tool_calls", [])
        }
    finally:
        # Clear database session
        set_db_session(None)


def get_chat_history(thread_id: str) -> list:
    """Get chat history for a thread"""
    config = {"configurable": {"thread_id": thread_id}}
    current_state = app.get_state(config)
    
    if not current_state or not current_state.values:
        return []
        
    messages = current_state.values.get("messages", [])
    
    # Format messages for frontend
    history = []
    for msg in messages:
        # Skip system messages
        if AGENT_SYSTEM_PROMPT in str(msg.content):
            continue
            
        role = "user" if isinstance(msg, HumanMessage) else "assistant"
        
        # Simple ID generation (hashed from content + index or similar)
        # For now we just use a placeholder or let frontend handle it if not critical
        # But frontend needs ID.
        
        history.append({
            "role": role,
            "content": msg.content,
            # tool_calls?
        })
        
    return history
