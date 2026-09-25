import { GoogleGenerativeAI } from "@google/generative-ai";

export async function extractImageVibe(base64Image: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("No GEMINI_API_KEY found, using mock vision data");
    return {
      scene: "A sunlit cafe with wooden tables and plants",
      lighting: "Soft, natural daylight",
      dominantColors: ["warm brown", "green", "soft white"],
      activity: "Relaxing, drinking coffee",
      timeOfDay: "Morning"
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert visual analyst. Your task is to extract structural visual attributes from an image to inform a vibe-matching algorithm for music and captions. 

Respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or extra text:
{
  "scene": "string (brief description of the location/setting)",
  "lighting": "string (description of lighting style/mood)",
  "dominantColors": ["string", "string"],
  "activity": "string (what is happening or the implied action)",
  "timeOfDay": "string (e.g., Morning, Golden Hour, Night, Unknown)"
}`;

  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    }
  ];

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Vision API error", error);
    throw new Error("Failed to extract image vibe");
  }
}

// Aggregates multiple vision analysis results into one cohesive description for Step 2
export function aggregateVisionData(visionResults: any[]) {
  if (visionResults.length === 0) return null;
  if (visionResults.length === 1) return visionResults[0];

  // Combine colors uniquely
  const allColors = visionResults.flatMap(r => r.dominantColors || []);
  const dominantColors = Array.from(new Set(allColors)).slice(0, 5);

  // For text fields, we can just join them to give the LLM context of the full "carousel story"
  return {
    scene: "Carousel sequence: " + visionResults.map(r => r.scene).join(" -> "),
    lighting: visionResults.map(r => r.lighting)[0],
    dominantColors,
    activity: visionResults.map(r => r.activity).join(" then "),
    timeOfDay: visionResults[0].timeOfDay 
  };
}
