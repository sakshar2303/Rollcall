import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { type, targetId, isPositive } = await req.json();
    
    if (!type || !targetId || typeof isPositive !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionId = await getOrCreateSessionId();

    const data: any = {
      sessionId,
      isPositive,
    };

    if (type === "song") {
      data.songSuggestionId = targetId;
    } else if (type === "caption") {
      data.captionSuggestionId = targetId;
    } else {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data,
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("[Feedback] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 });
  }
}
