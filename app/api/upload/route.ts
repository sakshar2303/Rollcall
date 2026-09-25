import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe } from "@/lib/vision";
import { classifyVibe } from "@/lib/jevai";
import { getSongRecommendations } from "@/lib/matching";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = (formData.get("language") as string) || "English";
    const genre = (formData.get("genre") as string) || "pop";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log(`[Upload] Processing image: ${file.name} (${file.type}) - Lang: ${language}, Genre: ${genre}`);
    
    // Step 1: Extract structured vision data
    const visionData = await extractImageVibe(base64Image);
    console.log("[Upload] Vision Data Extracted");

    // Step 2: Vibe classification via Jev AI
    const classificationData = await classifyVibe(visionData);
    console.log("[Upload] Classification Data Extracted");

    // Step 3 & 4: Map vibes to Spotify audio features and search
    const songRecommendations = await getSongRecommendations(classificationData, language, [genre]);
    console.log(`[Upload] Found ${songRecommendations.length} songs`);

    // TODO: 1. Save to Prisma DB (Upload, Photo records)
    // TODO: 4. Generate & rank captions

    return NextResponse.json({
      vision: visionData,
      classification: classificationData,
      songs: songRecommendations
    });
    
  } catch (error) {
    console.error("[Upload] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
