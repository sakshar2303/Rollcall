import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe } from "@/lib/vision";
import { classifyVibe } from "@/lib/jevai";
import { getSongRecommendations } from "@/lib/matching";
import { generateAndRankCaptions } from "@/lib/captions";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";

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
    
    const sessionId = await getOrCreateSessionId();

    // Step 1: Extract structured vision data
    const visionData = await extractImageVibe(base64Image);
    
    // Step 2: Vibe classification via Jev AI
    const classificationData = await classifyVibe(visionData);

    // Step 3 & 4: Map vibes to Spotify audio features and search
    // We pass the sessionId here to optionally allow getSongRecommendations to use feedback history in the future (Step 6 bias)
    const songRecommendations = await getSongRecommendations(classificationData, language, [genre]);

    // Step 5: Generate & rank captions
    const rankedCaptions = await generateAndRankCaptions(visionData, classificationData);

    // Step 6: Save everything to Prisma DB
    const upload = await prisma.upload.create({
      data: {
        sessionId,
        language,
        photos: {
          create: {
            url: "local-base64-omitted", // In production this would be an S3/Cloudinary URL
            scene: visionData.scene,
            lighting: visionData.lighting,
            dominantColors: visionData.dominantColors || [],
            activity: visionData.activity,
            timeOfDay: visionData.timeOfDay,
          }
        },
        classification: {
          create: {
            choice: classificationData.choice,
            score: classificationData.score,
            isAesthetic: classificationData.isAesthetic
          }
        },
        songSuggestions: {
          create: songRecommendations.map(song => ({
            spotifyId: song.spotifyId,
            title: song.title,
            artist: song.artist,
            albumArt: song.albumArt,
            previewUrl: song.previewUrl,
            targetEnergy: song.targetEnergy,
            trackEnergy: song.trackEnergy,
            targetValence: song.targetValence,
            trackValence: song.trackValence
          }))
        },
        captionSuggestions: {
          create: rankedCaptions.map(caption => ({
            text: caption.text,
            predictedEngagementScore: caption.predictedEngagementScore,
            toneCategory: caption.toneCategory,
            isCliche: caption.isCliche
          }))
        }
      },
      include: {
        songSuggestions: true,
        captionSuggestions: true
      }
    });

    return NextResponse.json({
      uploadId: upload.id,
      vision: visionData,
      classification: classificationData,
      songs: upload.songSuggestions,
      captions: upload.captionSuggestions
    });
    
  } catch (error) {
    console.error("[Upload] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
