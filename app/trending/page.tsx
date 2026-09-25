import { Music, TrendingUp, AlertCircle } from "lucide-react";
import { getSpotifyToken } from "@/lib/spotify";

export const revalidate = 3600;

async function getTrendingPlaylists() {
  const token = await getSpotifyToken();

  if (token === "mock_token") {
    return [
      {
        id: "mock1",
        name: "Top 50 — Global",
        description: "Your daily update of the most played tracks right now — Global.",
        images: [{ url: "https://charts-images.scdn.co/assets/locale_en/regional/daily/region_global_default.jpg" }],
        tracks: { items: [] }
      },
      {
        id: "mock2",
        name: "Viral 50 — Global",
        description: "Your daily update of the most viral tracks right now — Global.",
        images: [{ url: "https://charts-images.scdn.co/assets/locale_en/viral/daily/region_global_default.jpg" }],
        tracks: { items: [] }
      }
    ];
  }

  const playlistIds = ["37i9dQZEVXbMDoHDwVN2tF", "37i9dQZEVXbLiRSasKsNU9", "37i9dQZF1DXcBWIGoYBM5M"];

  try {
    const playlists = await Promise.all(
      playlistIds.map(async (id) => {
        const res = await fetch(
          `https://api.spotify.com/v1/playlists/${id}?fields=id,name,description,images,tracks.items(track(id,name,artists,album(images),preview_url))`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return null;
        return res.json();
      })
    );
    return playlists.filter(Boolean);
  } catch (e) {
    console.error("Failed to fetch trending", e);
    return [];
  }
}

export default async function TrendingPage() {
  const playlists = await getTrendingPlaylists();
  const isMock = playlists.some((p: any) => p.id?.startsWith("mock"));

  return (
    <main className="min-h-screen w-full max-w-screen-xl mx-auto px-6 lg:px-10 pt-10 pb-24">

      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-12 fade-up">
        <div className="pill">
          <TrendingUp size={12} strokeWidth={2.5} />
          Live from Spotify
        </div>
        <h1 className="font-serif text-5xl lg:text-6xl tracking-tight">
          Trending Now
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg font-light">
          The songs the world is listening to right now.
        </p>
      </div>

      {/* ── Transparency Note ──────────────────────────────── */}
      {isMock && (
        <div className="flex items-start gap-3 glass rounded-xl p-4 mb-12 max-w-2xl fade-up">
          <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Demo mode:</strong> Add your{" "}
            <code className="text-primary text-xs bg-muted/60 px-1 py-0.5 rounded">SPOTIFY_CLIENT_ID</code>{" "}
            and{" "}
            <code className="text-primary text-xs bg-muted/60 px-1 py-0.5 rounded">SPOTIFY_CLIENT_SECRET</code>{" "}
            to your <code className="text-primary text-xs bg-muted/60 px-1 py-0.5 rounded">.env</code> file
            to see real live charts from Spotify's Top 50 &amp; Viral 50.
          </p>
        </div>
      )}

      {/* ── Playlist Sections ──────────────────────────────── */}
      <div className="flex flex-col gap-20">
        {playlists.map((playlist: any, sectionIdx: number) => (
          <section key={playlist.id} className="flex flex-col gap-6 fade-up">

            {/* Section header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border/60">
              {playlist.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                  <Music size={24} className="text-muted-foreground" />
                </div>
              )}
              <div>
                <h2 className="font-sans text-2xl font-semibold">{playlist.name}</h2>
                <p className="text-muted-foreground text-sm mt-0.5 max-w-lg line-clamp-1">
                  {playlist.description?.replace(/<[^>]*>/g, "")}
                </p>
              </div>
            </div>

            {/* Track grid */}
            {playlist.tracks?.items?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {playlist.tracks.items.slice(0, 9).map((item: any, i: number) => {
                  const track = item?.track;
                  if (!track) return null;

                  return (
                    <div
                      key={track.id}
                      className="hover-lift flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 group transition-colors cursor-default"
                    >
                      <span className={`rank-badge ${i < 3 ? "top" : ""}`}>
                        {i + 1}
                      </span>
                      {track.album?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.album.images[0].url}
                          alt={track.name}
                          className="w-11 h-11 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <Music size={14} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {track.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artists?.[0]?.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Mock-mode empty state */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                    <div className="rank-badge">{i + 1}</div>
                    <div className="shimmer w-11 h-11 rounded-md shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="shimmer h-3 w-3/4 rounded" />
                      <div className="shimmer h-2.5 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
