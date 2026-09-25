export type VibeClassification = {
  choice: "chill" | "energetic" | "romantic" | "nostalgic" | "moody" | "adventurous";
  score: number; // 1-5 energy level
  isAesthetic: boolean; // Yes/No: aesthetic vs candid
};

export type CaptionRanking = {
  predictedEngagementScore: number;
  toneCategory: string;
  isCliche: boolean;
};

export async function classifyVibe(visionData: any): Promise<VibeClassification> {
  const apiKey = process.env.JEVAI_API_KEY;
  
  if (!apiKey) {
    console.warn("No JEVAI_API_KEY found, using mock classification data");
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Return mock data for testing
    return {
      choice: "chill",
      score: 2,
      isAesthetic: true,
    };
  }

  try {
    const response = await fetch("https://api.jev-ai.pro/v1/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: JSON.stringify(visionData),
        tasks: {
          moodCategory: {
            type: "choice",
            options: ["chill", "energetic", "romantic", "nostalgic", "moody", "adventurous"]
          },
          energyLevel: {
            type: "score",
            range: [1, 5]
          },
          isAesthetic: {
            type: "yes-no",
            question: "Is this an aesthetic/posed shot (Yes) or a candid shot (No)?"
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Jev AI Classification failed: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      choice: data.results.moodCategory.value,
      score: data.results.energyLevel.value,
      isAesthetic: data.results.isAesthetic.value === "yes" || data.results.isAesthetic.value === true,
    };
  } catch (error) {
    console.error("Error classifying vibe via Jev AI:", error);
    throw error;
  }
}

export async function rankCaption(caption: string, visionData: any): Promise<CaptionRanking> {
  const apiKey = process.env.JEVAI_API_KEY;
  
  if (!apiKey) {
    // Return mock data for testing
    return {
      predictedEngagementScore: 7.5 + Math.random() * 2, // 7.5 to 9.5
      toneCategory: "playful",
      isCliche: Math.random() > 0.8, // 20% chance of being cliche
    };
  }

  try {
    const response = await fetch("https://api.jev-ai.pro/v1/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: `Caption: ${caption}\n\nContext:\n${JSON.stringify(visionData)}`,
        tasks: {
          engagementScore: {
            type: "score",
            range: [1, 10]
          },
          toneCategory: {
            type: "choice",
            options: ["playful", "witty", "poetic", "direct", "mysterious"]
          },
          isCliche: {
            type: "yes-no",
            question: "Is this caption a cliché or overused Instagram phrasing?"
          }
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Jev AI Ranking failed: ${await response.text()}`);
    }

    const data = await response.json();
    return {
      predictedEngagementScore: data.results.engagementScore.value,
      toneCategory: data.results.toneCategory.value,
      isCliche: data.results.isCliche.value === "yes" || data.results.isCliche.value === true,
    };
  } catch (error) {
    console.error("Error ranking caption via Jev AI:", error);
    throw error;
  }
}
