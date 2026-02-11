import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "uprev_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Get existing session ID from cookies or generate a new one
 */
export async function getOrCreateSessionId(): Promise<string> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
        sessionId = uuidv4();
    }

    return sessionId;
}

/**
 * Set session ID cookie in the response
 * This should be called when creating a new session
 */
export async function setSessionCookie(sessionId: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });
}
