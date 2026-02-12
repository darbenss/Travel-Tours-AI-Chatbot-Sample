import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, sessionId } = await req.json();

        // Get the last user message
        const lastMessage = messages[messages.length - 1];

        // Extract content from parts (Vercel AI SDK 3.0+) or content field
        let userMessageContent = lastMessage?.content || "";

        if (!userMessageContent && lastMessage?.parts) {
            userMessageContent = lastMessage.parts
                .filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('') || "";
        }

        // Default thread ID or generate one
        // Ideally pass sessionId from client if available, or generate here
        // The Python backend expects "thread_id"
        const threadId = sessionId || "default-thread";

        if (!userMessageContent || typeof userMessageContent !== 'string' || userMessageContent.trim() === '') {
            console.error("Invalid message content:", userMessageContent);
            return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
        }

        const payload = {
            message: userMessageContent,
            thread_id: threadId
        };

        console.log("Sending payload to Python backend:", JSON.stringify(payload));

        // Call Python Backend
        // Use 127.0.0.1 for localhost to avoid IPv6 issues commonly on Windows
        const pythonResponse = await fetch("http://127.0.0.1:8000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!pythonResponse.ok) {
            console.error("Python Backend Error:", pythonResponse.status, pythonResponse.statusText);
            return NextResponse.json({ error: "Failed to connect to AI service" }, { status: 500 });
        }

        const data = await pythonResponse.json();

        // Return JSON from Python backend
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
