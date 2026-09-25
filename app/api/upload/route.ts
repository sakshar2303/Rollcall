import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe } from "@/lib/vision";
import { classifyVibe } from "@/lib/jevai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log(`[Upload] Processing image: ${file.name} (${file.type})`);
    
    // Step 1: Extract structured vision data
    const visionData = await extractImageVibe(base64Image);
    console.log("[Upload] Vision Data Extracted:", visionData);

    // Step 2: Vibe classification via Jev AI
    const classificationData = await classifyVibe(visionData);
    console.log("[Upload] Classification Data Extracted:", classificationData);

    // TODO: In subsequent steps, we will:
    // 1. Save to Prisma DB (Upload, Photo records)
    // 3. Match songs via Spotify
    // 4. Generate & rank captions

    // Return the combined data to confirm Steps 1 & 2 work
    return NextResponse.json({
      vision: visionData,
      classification: classificationData
    });
    
  } catch (error) {
    console.error("[Upload] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
