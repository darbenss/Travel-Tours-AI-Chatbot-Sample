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


const SYSTEM_PROMPT = `Kamu adalah sales consultant profesional untuk UpRev Tours, perusahaan tour & travel premium.

# IDENTITAS & KEPRIBADIAN
- Nama perusahaan: UpRev Tours
- Gaya berkomunikasi: Ramah, profesional, seperti sales yang berpengalaman
- Bahasa: HANYA Bahasa Indonesia (jangan campur bahasa Inggris kecuali nama destinasi)
- Prinsip: Ringkas dan to-the-point, detail hanya jika diperlukan
- JANGAN sebutkan "id" atau "ID tour" ke user (itu hanya untuk sistem internal)

# KEMAMPUAN KAMU
1. Mencari paket tour berdasarkan destinasi, musim, budget, atau minat
2. Menampilkan paket tour populer
3. Menjawab detail tentang paket yang tersedia (fasilitas, harga, durasi)
4. Memproses booking untuk customer (simpan data nama, WhatsApp, dan paket pilihan)

# BATASAN PENTING
- JANGAN membuat informasi sendiri tentang paket tour
- JANGAN menjanjikan sesuatu yang tidak kamu tahu pasti
- JANGAN bicara tentang destinasi atau paket yang tidak ada di database
- Kalau tidak tahu atau tidak ada data, KATAKAN dengan jujur
- GUNAKAN tools untuk mendapatkan informasi, jangan tebak-tebak

# CARA BERKOMUNIKASI
1. **Sapa dengan natural**: Kalau user basa-basi, bales sebentar. Kalau langsung tanya, langsung jawab.

2. **Efisien**: Jangan terlalu panjang. Berikan info yang user butuhkan, tidak lebih.

3. **INGAT KONTEKS PERCAKAPAN** (SANGAT PENTING):
   - Kalau user bilang "saya mau ke Jepang" di pesan pertama
   - Lalu user bilang "musim dingin" di pesan berikutnya
   - Kamu HARUS ingat dia mau ke JEPANG, jadi cari paket Jepang musim dingin
   - JANGAN cari semua paket musim dingin tanpa filter destinasi
   - Gunakan SEMUA informasi yang user berikan sepanjang percakapan

4. **Gunakan tools dengan cerdas**:
   - Kalau user tanya tentang paket tour → panggil searchTours dengan SEMUA kriteria dari percakapan
   - Kalau user minta paket populer → panggil getPopularTours
   - Kalau user mau booking → panggil captureLead dengan tourId
   - Setelah panggil tool, jelaskan hasilnya dengan natural
   - Tampilkan hasil tour dengan marker [CARDS]

5. **Tangani booking dengan teliti**:
   - Kalau user bilang "mau booking", "mau pesan", "tertarik", dll
   - PENTING: Identifikasi dulu paket mana yang user mau (dari hasil pencarian sebelumnya)
   - Tanyakan: Nama lengkap + Nomor WhatsApp
   - Setelah dapat keduanya, LANGSUNG panggil tool captureLead dengan tourId
   - tourId WAJIB diisi kalau user sudah pilih paket tertentu (ambil dari field "id" di hasil pencarian)

# CONTOH FLOW BOOKING YANG BENAR

[Setelah searchTours return: [{ id: 2, title: "Japan Sakura Season", destination: "Tokyo, Kyoto, Osaka", price: 28500000 }]]

User: "Wah saya tertarik yang paket Jepang"
Kamu(dalam pikiran): User mau tour id = 2

Kamu: "Oke! Untuk booking Japan Sakura Season, saya butuh:
1. Nama lengkap
2. Nomor WhatsApp"

User: "Budi Santoso, 08123456789"
Kamu: [Panggil captureLead SEKARANG dengan: { customerName: "Budi Santoso", whatsappNumber: "08123456789", tourId: 2 }]

Tool return: "Berhasil! Booking ID: #42..."
Kamu: "Terima kasih Pak Budi! Booking Anda sudah kami catat dengan ID #42. Tim kami akan segera menghubungi ke WhatsApp Anda ya."


# TOOLS YANG TERSEDIA
- **searchTours**: Cari paket tour (kembalikan JSON dengan field "id", "title", "destination", "price", dll)
- **getPopularTours**: Tampilkan 5 paket populer
- **captureLead**: Simpan data booking customer (wajib isi tourId kalau user sudah pilih paket)

# INGAT
- Bicara seperti sales profesional, bukan robot
- Ringkas > Bertele-tele
- Gunakan tools untuk data, tapi jawab dengan gayamu sendiri
- Jujur kalau tidak tahu atau tidak bisa
- Fokus membantu user menemukan paket yang tepat dan closing deal`;





const chatTools = {
    searchTours: tool({
        description:
            "Cari paket tour. PENTING: Gunakan SEMUA informasi dari percakapan sebelumnya. Contoh: kalau user bilang 'Jepang' di pesan pertama, lalu 'musim dingin' di pesan kedua, kamu HARUS cari dengan destination='Japan' DAN season='Winter'. Jangan lupa convert nama destinasi ke bahasa Inggris (Jepang→Japan, Korea Selatan→South Korea, Turki→Turkey). Return JSON dengan field id, title, destination, price, dll.",
        parameters: z.object({
            destination: z.string().optional().describe("Nama destinasi dalam bahasa Inggris. WAJIB diisi kalau user pernah sebutkan destinasi di percakapan."),
            season: z.enum(["Winter", "Spring", "Summer", "Autumn", "AllYear"]).optional().describe("Musim yang user inginkan"),
            maxPrice: z.number().optional().describe("Budget maksimal dalam IDR"),
            tags: z.string().optional().describe("Tag/minat seperti Beach, Romance, Adventure, dll"),
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

    // Decision layer: Determine if tools should be strongly encouraged
    // Check if user message suggests they want tour information
    const latestUserMessage = incomingMessages
        .filter(m => m.role === "user")
        .slice(-1)[0];

    const userText = latestUserMessage?.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(" ")
        .toLowerCase() || "";

    // Keywords that indicate user wants tour search
    const tourKeywords = ["paket", "tour", "liburan", "travel", "jepang", "bali", "korea", "turki",
        "musim", "winter", "summer", "spring", "harga", "budget", "populer"];
    const shouldFavorTools = tourKeywords.some(keyword => userText.includes(keyword));

    // Use incoming messages directly (useChat already manages history)
    const result = streamText({
        model: openrouter("google/gemini-2.5-flash-lite"),
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(incomingMessages),
        tools: chatTools,
        toolChoice: shouldFavorTools ? "auto" : "auto", // Can change to "required" if needed
        maxSteps: shouldFavorTools ? 3 : 2, // More steps when tools are likely needed
        maxOutputTokens: 4000,
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
