const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;

export async function getSpotifyToken(): Promise<string> {
  // Return cached token if valid
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn("Spotify credentials missing! Using mock API.");
    return "mock_token";
  }

  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${await response.text()}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // Expire 5 minutes early to be safe
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  return cachedToken!;
}

export async function getTrackAudioFeatures(trackId: string) {
  const token = await getSpotifyToken();

  if (token === "mock_token") {
    // Return mock audio features for testing
    return {
      id: trackId,
      danceability: 0.735,
      energy: 0.578,
      key: 5,
      loudness: -11.840,
      mode: 0,
      speechiness: 0.0461,
      acousticness: 0.514,
      instrumentalness: 0.0902,
      liveness: 0.159,
      valence: 0.624,
      tempo: 98.002,
      type: "audio_features",
    };
  }

  const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get audio features: ${await response.text()}`);
  }

  return await response.json();
}
