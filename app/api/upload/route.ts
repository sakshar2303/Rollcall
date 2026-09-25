import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe, aggregateVisionData } from "@/lib/vision";
import { classifyVibe } from "@/lib/jevai";
import { getSongRecommendations } from "@/lib/matching";
import { generateAndRankCaptions } from "@/lib/captions";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const language = (formData.get("language") as string) || "English";
    const genre = (formData.get("genre") as string) || "pop";
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    console.log(`[Upload] Processing ${files.length} images - Lang: ${language}, Genre: ${genre}`);
    
    const sessionId = await getOrCreateSessionId();

    // Process all images in parallel
    const visionPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      return extractImageVibe(base64Image);
    });

    // Step 1: Extract structured vision data for all frames
    const visionResults = await Promise.all(visionPromises);
    const aggregatedVisionData = aggregateVisionData(visionResults);
    
    // Step 2: Vibe classification via Jev AI using the aggregated data
    const classificationData = await classifyVibe(aggregatedVisionData);

    // Step 3 & 4: Map vibes to Spotify audio features and search
    const songRecommendations = await getSongRecommendations(classificationData, language, [genre]);

    // Step 5: Generate & rank captions
    const rankedCaptions = await generateAndRankCaptions(aggregatedVisionData, classificationData);

    // Step 6: Save everything to Prisma DB
    const upload = await prisma.upload.create({
      data: {
        sessionId,
        language,
        photos: {
          create: visionResults.map(v => ({
            url: "local-base64-omitted", // In production this would be an S3 URL
            scene: v.scene,
            lighting: v.lighting,
            dominantColors: v.dominantColors || [],
            activity: v.activity,
            timeOfDay: v.timeOfDay,
          }))
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
      vision: aggregatedVisionData,
      classification: classificationData,
      songs: upload.songSuggestions,
      captions: upload.captionSuggestions
    });
    
  } catch (error) {
    console.error("[Upload] Error processing request:", error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
