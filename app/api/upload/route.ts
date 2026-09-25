import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe } from "@/lib/vision";

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

    // TODO: In subsequent steps, we will:
    // 1. Save to Prisma DB (Upload, Photo records)
    // 2. Call Jev AI for vibe classification
    // 3. Match songs via Spotify
    // 4. Generate & rank captions

    // For now, return the vision data to confirm Step 1 works
    return NextResponse.json(visionData);
    
  } catch (error) {
    console.error("[Upload] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
