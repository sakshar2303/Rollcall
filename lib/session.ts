import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SESSION_COOKIE_NAME = "rollcall_session_id";

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    // Create new session in DB
    const session = await prisma.session.create({ data: {} });
    sessionId = session.id;
    
    // Set cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    // Verify it exists in DB, if not recreate
    const existing = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!existing) {
      const session = await prisma.session.create({ data: {} });
      sessionId = session.id;
      cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }

  return sessionId;
}
