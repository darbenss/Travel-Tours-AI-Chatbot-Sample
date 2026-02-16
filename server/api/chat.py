"""Chat API endpoint"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from models.schemas import ChatRequest, ChatResponse
from services.agent_service import chat
from db.session import get_db_session
import uuid

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db_session)
):
    """Main chat endpoint for the AI agent
    
    Request:
        {
            "message": "Saya mau ke Hokkaido",
            "thread_id": "user-123"  // optional, for conversation continuity
        }
    
    Response:
        {
            "id": "msg-abc123",
            "role": "assistant",
            "content": "Saya menemukan paket ke Jepang!"
        }
    """
    
    try:
        # Generate or use provided thread_id for conversation continuity
        thread_id = request.thread_id or str(uuid.uuid4())
        
        # Execute LangGraph agent
        result = chat(
            user_message=request.message,
            thread_id=thread_id,
            db=db
        )
        
        # Generate unique message ID
        message_id = f"msg-{uuid.uuid4().hex[:12]}"
        
        return ChatResponse(
            id=message_id,
            role="assistant",
            content=result["content"]
        )
    
    except Exception as e:
        # Log the error
        print(f"❌ Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=500,
            detail="Maaf, terjadi kesalahan. Silakan coba lagi."
        )

@router.get("/history/{thread_id}")
async def get_history_endpoint(thread_id: str):
    """Get chat history for a thread"""
    from services.agent_service import get_chat_history
    
    try:
        history = get_chat_history(thread_id)
        return history
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []
