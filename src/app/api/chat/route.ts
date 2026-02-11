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

const SYSTEM_PROMPT = `You are a friendly and professional customer service assistant for **UpRev Tours**.

**Language Requirement:**
You MUST respond in **Bahasa Indonesia** (Indonesian) for all interactions.

**Your Goal:**
Help users find their dream vacation and capture their contact info for booking.

**Interaction Flow & Rules:**
1.  **Greeting**: 
    - **IF** the user says "Halo", "Hi", or "Selamat Pagi", greet them warmly.
    - **IF** the user asks a specific question (e.g., "Cari paket ke Jepang", "Ada tur ke Bali?"), **SKIP the greeting** and proceed directly to searching.
2.  **Search/Recommendation**:
    - When asked for a trip, **call the \`searchTours\` tool**.
    - **Before** the tool result arrives, you may say a **neutral** confirmation like "Baik, tunggu sebentar ya, saya carikan paket liburan ke [Destinasi] untuk Anda."
    - **CRITICAL**: Do NOT say "Saya punya rekomendasi" or "Pilihan hebat" BEFORE the tool result. You don't know if packages exist yet.
3.  **Handling Tool Results**:
    - **IF Tours Found (JSON array)**:
        - Start with an enthusiastic intro (e.g., "Pilihan hebat! Berikut adalah rekomendasi paket liburan terbaik untuk Anda:").
        - **IMMEDIATELY** after the intro, output the marker: \`[CARDS]\`.
        - **AFTER** the marker, provide a brief description or highlight of the tours shown.
        - *Example Output*: "Pilihan hebat! Kami punya paket menarik. [CARDS] Paket ini mencakup penerbangan dan hotel bintang 5..."
    - **IF No Tours Found (Tool returns string "Maaf...")**:
        - Simply apologize and suggest another destination.
        - **DO NOT** use the \`[CARDS]\` marker.
        - *Example Output*: "Maaf, saat ini kami belum memiliki paket tour ke destinasi tersebut. Apakah Anda tertarik dengan destinasi lain?"
4.  **Details**: If asked for specific details, answer using the tour's \`highlights\`.
5.  **Booking**: If user wants to book, ask for Name + WA, then use \`captureLead\`.

**Tools:**
- \`searchTours\`: Search for tours.
- \`getPopularTours\`: Get featured tours.
- \`captureLead\`: Capture lead.

**Tone:**
Warm, helpful, professional. Use emojis ✈️🌍.`;

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
                const searchTags = tags.split(",").map((t) => t.trim().toLowerCase());
                filteredResults = results.filter((tour) => {
                    const tourTags = tour.tags.split(",").map((t) => t.trim().toLowerCase());
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
        description: "Capture booking lead.",
        parameters: z.object({
            customerName: z.string(),
            whatsappNumber: z.string(),
            tourId: z.number().optional(),
        }),
        execute: async ({ customerName, whatsappNumber, tourId }) => {
            const [booking] = await db
                .insert(bookings)
                .values({
                    customerName,
                    contactInfo: whatsappNumber,
                    tourId: tourId ?? null,
                    status: "pending",
                })
                .returning();

            const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
            const message = encodeURIComponent(
                `Halo, saya ${customerName}. Saya tertarik untuk booking tour (ID: #${booking.id}).`
            );
            const waLink = `https://wa.me/${cleanNumber}?text=${message}`;

            return `✅ Berhasil! Booking ID: #${booking.id}. Tim kami akan segera menghubungi Anda. Klik di sini untuk chat: ${waLink}`;
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

    // Load conversation history from database
    const historyRecords = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversation.id))
        .orderBy(messages.createdAt);

    // Convert DB messages to AI SDK format
    const historyMessages: UIMessage[] = historyRecords.map((msg) => {
        const baseMessage: UIMessage = {
            id: msg.id.toString(),
            role: msg.role as "user" | "assistant",
            parts: msg.toolInvocations
                ? JSON.parse(msg.toolInvocations)
                : [{ type: "text", text: msg.content }],
        };
        return baseMessage;
    });

    // Combine history with new messages
    const allMessages = [...historyMessages, ...incomingMessages];

    // Save user message(s) to database
    for (const msg of incomingMessages) {
        if (msg.role === "user") {
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

    const result = streamText({
        model: openrouter("google/gemini-2.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(allMessages),
        tools: chatTools,
        maxOutputTokens: 4000,
        stopWhen: stepCountIs(5),
        async onFinish({ text, toolCalls }) {
            // Save assistant response to database
            const toolInvocationsJson = toolCalls && toolCalls.length > 0
                ? JSON.stringify(toolCalls)
                : null;

            await db.insert(messages).values({
                conversationId: conversation!.id,
                role: "assistant",
                content: text,
                toolInvocations: toolInvocationsJson,
            });

            // Update conversation timestamp
            await db
                .update(conversations)
                .set({ updatedAt: new Date() })
                .where(eq(conversations.id, conversation!.id));
        },
    });

    return result.toUIMessageStreamResponse();
}
