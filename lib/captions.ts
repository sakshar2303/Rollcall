import { rankCaption, CaptionRanking, VibeClassification } from "./jevai";

export type RankedCaption = CaptionRanking & {
  text: string;
};

export async function generateCaptionCandidates(visionData: any, vibe: VibeClassification): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("No OPENAI_API_KEY found, using mock captions");
    // Return mock data for testing the pipeline if no key is provided
    return [
      "Vibes only ✨",
      "Living my best life in the moment",
      "Just another day in paradise",
      "Feeling " + vibe.choice,
      "Caught the perfect light today",
      "Wandering where the WiFi is weak"
    ];
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert Instagram copywriter. Given a scene description and a target vibe, generate 6-8 unique, high-quality caption options for the photo. 
            Do not include hashtags. Do not use quotes around the captions. Output exactly one caption per line.
            The captions should range in tone (some short, some poetic, some witty).`
          },
          {
            role: "user",
            content: `Vibe: ${vibe.choice} (Energy: ${vibe.score}/5, Aesthetic: ${vibe.isAesthetic})\n\nScene Data: ${JSON.stringify(visionData)}`
          },
        ],
        max_tokens: 200,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate captions: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content as string;
    
    // Split by newlines and clean up empty strings or list numbers
    return content.split("\n")
      .map(c => c.replace(/^\d+\.\s*/, "").trim())
      .filter(c => c.length > 0)
      .slice(0, 8);
  } catch (error) {
    console.error("Error generating captions:", error);
    throw error;
  }
}

export async function generateAndRankCaptions(visionData: any, vibe: VibeClassification): Promise<RankedCaption[]> {
  // 1. Generate candidates
  const candidates = await generateCaptionCandidates(visionData, vibe);
  
  // 2. Rank all candidates via Jev AI in parallel
  const rankedPromises = candidates.map(async (text) => {
    try {
      const ranking = await rankCaption(text, visionData);
      return { text, ...ranking };
    } catch (e) {
      console.warn("Ranking failed for caption:", text);
      return null;
    }
  });
  
  const rankedResults = (await Promise.all(rankedPromises)).filter(Boolean) as RankedCaption[];
  
  // 3. Filter out cliches and sort by predicted engagement
  const validCaptions = rankedResults
    .filter(c => !c.isCliche)
    .sort((a, b) => b.predictedEngagementScore - a.predictedEngagementScore);
  
  // If all were cliché (rare), fallback to just sorting by score
  if (validCaptions.length === 0) {
    return rankedResults.sort((a, b) => b.predictedEngagementScore - a.predictedEngagementScore).slice(0, 3);
  }
  
  return validCaptions.slice(0, 3);
}
