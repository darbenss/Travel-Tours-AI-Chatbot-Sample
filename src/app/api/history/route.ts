import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
        return NextResponse.json({ error: "Thread ID required" }, { status: 400 });
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/history/${threadId}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch history" }, { status: response.status });
        }

        const history = await response.json();
        return NextResponse.json(history);
    } catch (error) {
        console.error("History fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
