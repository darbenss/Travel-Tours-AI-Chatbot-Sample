import {
    streamText,
    tool,
    convertToModelMessages,
    stepCountIs,
    type UIMessage,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { db } from "@/db";
import { tours, bookings, conversations, messages } from "@/db/schema";
import { ilike, lte, or, eq, desc } from "drizzle-orm";
import { getOrCreateSessionId, setSessionCookie } from "@/lib/session";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
});


const SYSTEM_PROMPT = `You are a friendly and professional customer service assistant for UpRev Tours.

LANGUAGE: You MUST respond in Bahasa Indonesia (Indonesian) for all interactions.

YOUR GOAL: Help users find their dream vacation and capture their contact info for booking.

INTERACTION FLOW:
1. GREETING: 
   - IF user says "Halo", "Hi", or "Selamat Pagi", greet them warmly.
   - IF user asks a specific question, SKIP greeting and proceed directly to searching.

2. SEARCH/RECOMMENDATION:
   - When asked for a trip, call the searchTours tool.
   - Before tool result: Say "Baik, tunggu sebentar ya, saya carikan paket liburan ke [Destinasi] untuk Anda."
   - CRITICAL: Do NOT say "Saya punya rekomendasi" BEFORE the tool result.

3. HANDLING TOOL RESULTS:
   - IF Tours Found (JSON array):
     * Start with enthusiastic intro: "Pilihan hebat! Berikut adalah rekomendasi paket liburan terbaik untuk Anda:"
     * IMMEDIATELY output the marker: [CARDS]
     * AFTER marker, provide brief highlights
     * REMEMBER: Each tour has an "id" field - you MUST remember these IDs
   - IF No Tours Found:
     * Apologize and suggest another destination
     * DO NOT use [CARDS] marker

4. DETAILS: If asked for specific details, answer using the tour's highlights.

5. BOOKING PROCESS - CRITICAL INSTRUCTIONS:
   
   WHEN TO BOOK:
   - User says: "mau booking", "mau book", "saya pesan", "booking dong", "saya tertarik", "mau daftar"
   
   TOUR ID DETECTION - VERY IMPORTANT:
   - IF user mentions a specific tour from search results (e.g., "yang Jepang", "paket Bali", "yang 28 juta"):
     * Find the matching tour from previous searchTours results
     * Extract the "id" field from that tour JSON
     * Use this ID when calling captureLead
   
   - IF user doesn't specify which tour:
     * Ask: "Paket tour mana yang Anda mina ti? Bisa sebutkan destinasinya?"
     * Wait for response, then match to previous results
   
   BOOKING STEPS - FOLLOW EXACTLY:
   Step 1: Identify which tour (get the tour ID)
   Step 2: Ask for information:
      "Baik! Untuk melanjutkan booking [TOUR NAME], saya butuh:
      1. Nama lengkap Anda
      2. Nomor WhatsApp Anda"
   
   Step 3: When user provides BOTH name AND WhatsApp:
      YOU MUST IMMEDIATELY CALL captureLead tool with:
      - customerName: (from user)
      - whatsappNumber: (from user)
      - tourId: (the ID from the tour they want)
      DO NOT just say "terima kasih" without calling the tool
   
   Step 4: After tool returns success:
      Show the booking confirmation message from the tool
   
   EXAMPLE WITH TOUR ID:
   [After searchTours returns: {id: 2, title: "Japan Sakura Season", price: 28500000...}]
   
   User: "Saya mau booking paket Jepang yang Sakura"
   You (thinking): User wants tour id=2 (Japan Sakura Season)
   You: "Baik! Untuk melanjutkan booking Japan Sakura Season, saya butuh: 1. Nama lengkap Anda 2. Nomor WhatsApp Anda"
   
   User: "Nama saya Budi, WA 08123456789"
   You: [MUST CALL captureLead with customerName: "Budi", whatsappNumber: "08123456789", tourId: 2]
   Tool returns: "Berhasil! Booking ID: #42..."
   You: Show that message to user

TOOLS AVAILABLE:
- searchTours: Search for tours by destination/keyword - Returns JSON with tour "id" field
- getPopularTours: Get featured/popular tours - Returns JSON with tour "id" field
- captureLead: MANDATORY when booking - Requires tourId from search results

TONE: Warm, helpful, professional.`;




const chatTools = {
    searchTours: tool({
        description:
            "Search for tour packages. IMPORTANT: Convert query to English destination name (e.g., 'Jepang' -> 'Japan', 'Korea Selatan' -> 'South Korea'). Returns structured JSON including title, price, description, highlights, and image.",
        parameters: z.object({
            destination: z.string().optional(),
            season: z.enum(["Winter", "Spring", "Summer", "Autumn", "AllYear"]).optional(),
            maxPrice: z.number().optional(),
            tags: z.string().optional(),
        }),
        execute: async ({ destination, season, maxPrice, tags }) => {
            console.log("🔍 [searchTours] Called with:", { destination, season, maxPrice, tags });

            let query = db.select().from(tours).$dynamic();
            const conditions = [];

            if (destination) {
                console.log(`🔎 [searchTours] Filtering by destination/keyword: ${destination}`);
                // Search across title, destination, and description for broad matching
                conditions.push(or(
                    ilike(tours.destination, `%${destination}%`),
                    ilike(tours.title, `%${destination}%`),
                    ilike(tours.description, `%${destination}%`)
                )!); // Using non-null assertion as execute ensures conditions are checked
            }
            if (season) conditions.push(or(eq(tours.season, season), eq(tours.season, "AllYear"))!);
            if (maxPrice) conditions.push(lte(tours.price, maxPrice));

            for (const condition of conditions) query = query.where(condition);

            const results = await query;
            console.log(`📦 [searchTours] DB Results found: ${results.length}`);

            let filteredResults = results;

            if (tags) {
                const searchTags = tags.split(",").map((t: string) => t.trim().toLowerCase());
                filteredResults = results.filter((tour) => {
                    const tourTags = tour.tags.split(",").map((t: string) => t.trim().toLowerCase());
                    return searchTags.some((st) => tourTags.includes(st));
                });
            }

            if (filteredResults.length === 0) {
                console.log("⚠️ [searchTours] No results after filtering.");
                return "Maaf, tidak ditemukan paket tour yang sesuai kriteria Anda.";
            }

            console.log(`✅ [searchTours] Returning ${filteredResults.length} tours (JSON).`);
            // Return JSON string for the model (and client) to consume
            return JSON.stringify(filteredResults);
        },
    }),

    getPopularTours: tool({
        description: "Get popular tour packages. Returns structured JSON.",
        parameters: z.object({}),
        execute: async () => {
            const results = await db.select().from(tours).limit(5);
            if (results.length === 0) return "Maaf, belum ada paket tour tersedia saat ini.";
            return JSON.stringify(results);
        },
    }),


    captureLead: tool({
        description: "CRITICAL: Call this tool when user provides name and WhatsApp for booking. IMPORTANT: If user mentioned a specific tour from search results, you MUST include the tourId parameter. Look for the 'id' field in previous searchTours or getPopularTours results. Example: if searchTours returned {id: 2, title: 'Japan Sakura'...} and user wants that tour, pass tourId: 2",
        parameters: z.object({
            customerName: z.string().describe("Customer's full name"),
            whatsappNumber: z.string().describe("Customer's WhatsApp number (e.g., 08123456789)"),
            tourId: z.number().optional().describe("Tour package ID from searchTours results - HIGHLY RECOMMENDED to include if user mentioned a specific tour"),
        }),
        execute: async ({ customerName, whatsappNumber, tourId }) => {
            try {
                console.log("[captureLead] Called with:", { customerName, whatsappNumber, tourId });

                // Validate tour exists if tourId provided
                if (tourId) {
                    const tour = await db
                        .select()
                        .from(tours)
                        .where(eq(tours.id, tourId))
                        .limit(1)
                        .then((rows) => rows[0]);

                    if (!tour) {
                        console.error("[captureLead] Tour not found:", tourId);
                        return `❌ Error: Tour dengan ID ${tourId} tidak ditemukan. Silakan pilih tour yang valid.`;
                    }
                }

                // Insert booking
                const [booking] = await db
                    .insert(bookings)
                    .values({
                        customerName,
                        contactInfo: whatsappNumber,
                        tourId: tourId ?? null,
                        status: "pending",
                    })
                    .returning();

                console.log("[captureLead] Booking created:", booking.id);

                // Generate WhatsApp link
                const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
                const message = encodeURIComponent(
                    `Halo, saya ${customerName}. Saya tertarik untuk booking tour (ID: #${booking.id}).`
                );
                const waLink = `https://wa.me/${cleanNumber}?text=${message}`;

                return `✅ Berhasil! Booking ID: #${booking.id}. Tim kami akan segera menghubungi Anda. Klik di sini untuk chat: ${waLink}`;
            } catch (error) {
                console.error("[captureLead] Error:", error);
                return `❌ Maaf, terjadi kesalahan saat menyimpan booking. Silakan coba lagi atau hubungi customer service kami.`;
            }
        },
    }),
};

export async function POST(req: Request) {
    const { messages: incomingMessages }: { messages: UIMessage[] } = await req.json();

    // Get or create session
    const sessionId = await getOrCreateSessionId();
    await setSessionCookie(sessionId);

    // Find or create conversation
    let conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.sessionId, sessionId))
        .limit(1)
        .then((rows) => rows[0]);

    if (!conversation) {
        [conversation] = await db
            .insert(conversations)
            .values({ sessionId })
            .returning();
    }

    // Get existing message IDs to avoid duplicates
    const existingMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(eq(messages.conversationId, conversation.id));

    const existingIds = new Set(existingMessages.map(m => m.id.toString()));

    // Save only NEW user messages to database (that aren't already saved)
    for (const msg of incomingMessages) {
        if (msg.role === "user" && !existingIds.has(msg.id)) {
            // Extract content from UIMessage parts
            const textContent = msg.parts
                ?.filter((p: any) => p.type === "text")
                .map((p: any) => p.text)
                .join(" ") || "";

            await db.insert(messages).values({
                conversationId: conversation.id,
                role: "user",
                content: textContent,
                toolInvocations: null,
            });
        }
    }

    // Use incoming messages directly (useChat already manages history)
    const result = streamText({
        model: openrouter("google/gemini-2.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(incomingMessages),
        tools: chatTools,
        toolChoice: "auto", // Let model decide when to use tools
        maxOutputTokens: 4000,
        stopWhen: stepCountIs(5),
        async onFinish({ text, toolCalls }) {
            try {
                console.log("[onFinish] Saving assistant response...");
                console.log("[onFinish] Text length:", text?.length || 0);
                console.log("[onFinish] Tool calls:", toolCalls?.length || 0);

                // Save assistant response to database
                const toolInvocationsJson = toolCalls && toolCalls.length > 0
                    ? JSON.stringify(toolCalls)
                    : null;

                const [savedMessage] = await db.insert(messages).values({
                    conversationId: conversation!.id,
                    role: "assistant",
                    content: text || "",
                    toolInvocations: toolInvocationsJson,
                }).returning();

                console.log("[onFinish] Assistant message saved with ID:", savedMessage.id);

                // Update conversation timestamp
                await db
                    .update(conversations)
                    .set({ updatedAt: new Date() })
                    .where(eq(conversations.id, conversation!.id));

                console.log("[onFinish] Conversation updated");
            } catch (error) {
                console.error("[onFinish] Error saving assistant message:", error);
            }
        },
    });

    return result.toUIMessageStreamResponse();
}
