export async function extractImageVibe(base64Image: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn("No OPENAI_API_KEY found, using mock vision data");
    // Return mock data for testing the pipeline if no key is provided
    return {
      scene: "A sunlit cafe with wooden tables and plants",
      lighting: "Soft, natural daylight",
      dominantColors: ["warm brown", "green", "soft white"],
      activity: "Relaxing, drinking coffee",
      timeOfDay: "Morning"
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert visual analyst. Your task is to extract structural visual attributes from an image to inform a vibe-matching algorithm for music and captions. 
            
Respond ONLY with a valid JSON object matching this exact structure, with no markdown formatting or extra text:
{
  "scene": "string (brief description of the location/setting)",
  "lighting": "string (description of lighting style/mood)",
  "dominantColors": ["string", "string"],
  "activity": "string (what is happening or the implied action)",
  "timeOfDay": "string (e.g., Morning, Golden Hour, Night, Unknown)"
}`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vision API Error:", errorText);
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting image vibe:", error);
    throw error;
  }
}
