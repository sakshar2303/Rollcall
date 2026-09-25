import { NextRequest, NextResponse } from "next/server";
import { extractImageVibe, aggregateVisionData } from "@/lib/vision";
import { classifyVibe } from "@/lib/jevai";
import { getSongRecommendations } from "@/lib/matching";
import { generateAndRankCaptions } from "@/lib/captions";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId } from "@/lib/session";

// ── Validation constants ──────────────────────────────────────────
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file
const MAX_FILES = 10;

// ── Simple in-memory rate limiter (per session, no Redis required) ─
// Falls back gracefully; replace with @upstash/ratelimit when Redis is available.
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;      // max requests
const RATE_WINDOW_MS = 60_000; // per 60 seconds

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(sessionId);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(sessionId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= RATE_LIMIT) return false; // blocked
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const language = (formData.get("language") as string) || "English";
    const genre = (formData.get("genre") as string) || "pop";
    
    // ── Validation ─────────────────────────────────────────────────
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WEBP, GIF, HEIC` },
          { status: 415 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the 10 MB limit` },
          { status: 413 }
        );
      }
    }

    console.log(`[Upload] Processing ${files.length} images - Lang: ${language}, Genre: ${genre}`);
    
    const sessionId = await getOrCreateSessionId();

    // ── Rate limiting ─────────────────────────────────────────────
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

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

    // Step 3 & 4: Map vibes to Spotify audio features and search (with personalization bias)
    const songRecommendations = await getSongRecommendations(classificationData, language, [genre], sessionId);

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
    
  } catch (error: any) {
    console.error("[Upload] Error processing request:", error);
    const message = error?.message || String(error) || "Unknown Server Crash";
    const stack = error?.stack || "";
    return NextResponse.json({ error: `CRASH: ${message} | STACK: ${stack}` }, { status: 500 });
  }
}
