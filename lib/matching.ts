import { VibeClassification } from "./jevai";
import { getSpotifyToken } from "./spotify";

export type SongSuggestion = {
  spotifyId: string;
  title: string;
  artist: string;
  albumArt: string;
  previewUrl: string | null;
  targetEnergy: number;
  trackEnergy: number;
  targetValence: number;
  trackValence: number;
};

// Map Jev AI vibe classification to Spotify target audio features
export function mapVibeToAudioFeatures(vibe: VibeClassification) {
  let targetValence = 0.5; // 0.0 to 1.0 (sad to happy)
  let targetEnergy = (vibe.score / 5.0); // Map 1-5 score to 0.0-1.0
  let targetDanceability = 0.5;
  let targetAcousticness = 0.5;

  switch (vibe.choice) {
    case "chill":
      targetValence = 0.6;
      targetEnergy = Math.min(targetEnergy, 0.4);
      targetAcousticness = 0.7;
      targetDanceability = 0.5;
      break;
    case "energetic":
      targetValence = 0.8;
      targetEnergy = Math.max(targetEnergy, 0.7);
      targetAcousticness = 0.1;
      targetDanceability = 0.8;
      break;
    case "romantic":
      targetValence = 0.7;
      targetAcousticness = 0.6;
      break;
    case "nostalgic":
      targetValence = 0.4;
      targetAcousticness = 0.5;
      break;
    case "moody":
      targetValence = 0.3;
      targetEnergy = Math.min(targetEnergy, 0.5);
      break;
    case "adventurous":
      targetValence = 0.7;
      targetEnergy = Math.max(targetEnergy, 0.6);
      targetDanceability = 0.6;
      break;
  }

  return { targetValence, targetEnergy, targetDanceability, targetAcousticness };
}

import { prisma } from "./prisma";

export async function getSongRecommendations(
  vibe: VibeClassification, 
  language: string = "English",
  genres: string[] = ["pop"],
  sessionId?: string
): Promise<SongSuggestion[]> {
  const token = await getSpotifyToken();
  const targetFeatures = mapVibeToAudioFeatures(vibe);

  // --- Personalization Bias (Feedback Loop) ---
  let energyOffset = 0;
  let valenceOffset = 0;

  if (sessionId) {
    // Fetch user's past feedback on songs
    const pastFeedback = await prisma.feedback.findMany({
      where: {
        sessionId,
        songSuggestionId: { not: null }
      },
      include: {
        songSuggestion: true
      },
      orderBy: { createdAt: "desc" },
      take: 10 // only look at recent feedback
    });

    if (pastFeedback.length > 0) {
      let energyAdjust = 0;
      let valenceAdjust = 0;

      for (const fb of pastFeedback) {
        if (!fb.songSuggestion) continue;
        
        // If they liked it, bias toward this song's actual features
        // If they disliked it, bias away from this song's features
        const weight = fb.isPositive ? 1 : -1;
        
        // Difference between the track and the original target
        const eDiff = fb.songSuggestion.trackEnergy - fb.songSuggestion.targetEnergy;
        const vDiff = fb.songSuggestion.trackValence - fb.songSuggestion.targetValence;
        
        energyAdjust += (eDiff * weight * 0.1); // Small nudge factor (10%)
        valenceAdjust += (vDiff * weight * 0.1);
      }

      // Average the adjustments
      energyOffset = energyAdjust / pastFeedback.length;
      valenceOffset = valenceAdjust / pastFeedback.length;
      
      console.log(`[Personalization] Applying bias offsets - Energy: ${energyOffset.toFixed(3)}, Valence: ${valenceOffset.toFixed(3)}`);
      
      targetFeatures.targetEnergy = Math.max(0, Math.min(1, targetFeatures.targetEnergy + energyOffset));
      targetFeatures.targetValence = Math.max(0, Math.min(1, targetFeatures.targetValence + valenceOffset));
    }
  }


  if (token === "mock_token") {
    // Return mock recommendations for testing
    return [
      {
        spotifyId: "mock123",
        title: "Neon Dreams",
        artist: "The Midnight",
        albumArt: "https://i.scdn.co/image/ab67616d0000b2734db4b6d0ad4de370f146a8c6",
        previewUrl: null,
        targetEnergy: targetFeatures.targetEnergy,
        trackEnergy: targetFeatures.targetEnergy + 0.05,
        targetValence: targetFeatures.targetValence,
        trackValence: targetFeatures.targetValence - 0.02,
      },
      {
        spotifyId: "mock456",
        title: "Vibe Check",
        artist: "Chillwave",
        albumArt: "https://i.scdn.co/image/ab67616d0000b2734db4b6d0ad4de370f146a8c6",
        previewUrl: null,
        targetEnergy: targetFeatures.targetEnergy,
        trackEnergy: targetFeatures.targetEnergy - 0.03,
        targetValence: targetFeatures.targetValence,
        trackValence: targetFeatures.targetValence + 0.04,
      }
    ];
  }

  // 1. Search for tracks matching the language and basic genre
  const query = encodeURIComponent(`genre:${genres.join(",")} language:${language}`);
  const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!searchRes.ok) {
    throw new Error(`Spotify Search failed: ${await searchRes.text()}`);
  }

  const searchData = await searchRes.json();
  const tracks = searchData.tracks.items;

  if (tracks.length === 0) {
    return [];
  }

  // 2. Fetch audio features for these tracks
  const trackIds = tracks.map((t: any) => t.id).join(",");
  const featuresRes = await fetch(`https://api.spotify.com/v1/audio-features?ids=${trackIds}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const featuresData = await featuresRes.json();
  const features = featuresData.audio_features;

  // 3. Score and rank tracks based on distance to target features
  const scoredTracks = tracks.map((track: any, index: number) => {
    const f = features[index];
    if (!f) return null;

    // Simple Euclidean distance (lower is better)
    const distance = Math.sqrt(
      Math.pow(f.valence - targetFeatures.targetValence, 2) +
      Math.pow(f.energy - targetFeatures.targetEnergy, 2) +
      Math.pow(f.danceability - targetFeatures.targetDanceability, 2)
    );

    return {
      track,
      features: f,
      distance
    };
  }).filter(Boolean);

  // Sort by distance (closest first)
  scoredTracks.sort((a: any, b: any) => a.distance - b.distance);

  // Map to output format (top 5)
  return scoredTracks.slice(0, 5).map((scored: any) => ({
    spotifyId: scored.track.id,
    title: scored.track.name,
    artist: scored.track.artists[0].name,
    albumArt: scored.track.album.images[0]?.url || "",
    previewUrl: scored.track.preview_url,
    targetEnergy: parseFloat(targetFeatures.targetEnergy.toFixed(2)),
    trackEnergy: parseFloat(scored.features.energy.toFixed(2)),
    targetValence: parseFloat(targetFeatures.targetValence.toFixed(2)),
    trackValence: parseFloat(scored.features.valence.toFixed(2)),
  }));
}
