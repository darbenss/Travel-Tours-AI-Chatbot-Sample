import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET endpoint to load conversation history for the current session
 */
export async function GET() {
    try {
        // Get session ID from cookie
        const sessionId = await getOrCreateSessionId();

        // Find conversation for this session
        const conversation = await db
            .select()
            .from(conversations)
            .where(eq(conversations.sessionId, sessionId))
            .limit(1)
            .then((rows) => rows[0]);

        // If no conversation exists yet, return empty array
        if (!conversation) {
            return NextResponse.json([]);
        }

        // Load all messages for this conversation
        const historyRecords = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversation.id))
            .orderBy(messages.createdAt);

        // Convert to UI format
        const historyMessages = historyRecords.map((msg) => ({
            id: msg.id.toString(),
            role: msg.role,
            parts: msg.toolInvocations
                ? JSON.parse(msg.toolInvocations)
                : [{ type: "text", text: msg.content }],
        }));

        return NextResponse.json(historyMessages);
    } catch (error) {
        console.error("[GET /api/chat] Error loading history:", error);
        return NextResponse.json([]);
    }
}
