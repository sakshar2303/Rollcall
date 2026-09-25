import { Music, AlertCircle } from "lucide-react";
import { getSpotifyToken } from "@/lib/spotify";

export const revalidate = 3600; // Revalidate every hour

async function getTrendingPlaylists() {
  const token = await getSpotifyToken();
  
  if (token === "mock_token") {
    return [
      { id: "mock1", title: "Top 50 - Global", description: "Your daily update of the most played tracks right now - Global.", image: "https://i.scdn.co/image/ab67706f00000003b53f6831d10e0f81d19ff564", tracks: [] },
      { id: "mock2", title: "Viral 50 - Global", description: "Your daily update of the most viral tracks right now - Global.", image: "https://i.scdn.co/image/ab67706f00000003cb877bb8f192b4752c3c126f", tracks: [] }
    ];
  }

  // We fetch a few known Spotify curated playlists for Trending
  // In a real app we'd fetch Top 50 Global (37i9dQZEVXbMDoHDwVN2tF), Viral 50 (37i9dQZEVXbLiRSasKsNU9)
  const playlistIds = ["37i9dQZEVXbMDoHDwVN2tF", "37i9dQZEVXbLiRSasKsNU9", "37i9dQZF1DXcBWIGoYBM5M"];
  
  try {
    const playlists = await Promise.all(playlistIds.map(async (id) => {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}?fields=id,name,description,images,tracks.items(track(id,name,artists,album(images),preview_url))`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return res.json();
    }));

    return playlists.filter(Boolean);
  } catch (e) {
    console.error("Failed to fetch trending", e);
    return [];
  }
}

export default async function TrendingPage() {
  const playlists = await getTrendingPlaylists();

  return (
    <main className="min-h-screen w-full flex flex-col pt-12 pb-24 px-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-12">
        <h1 className="font-serif text-5xl tracking-tight text-foreground">Trending Now</h1>
        
        <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 max-w-2xl">
          <AlertCircle size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Transparency Note:</strong> This data reflects real-time Spotify "Top 50", "Viral 50", and New Releases. 
            Instagram does not expose their internal trending-audio algorithm publicly, so these tracks represent what is currently 
            trending in general music consumption, rather than specific platform trends.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        {playlists.map((playlist: any) => (
          <section key={playlist.id} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {playlist.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playlist.images[0].url} alt={playlist.name} className="w-20 h-20 rounded-xl object-cover shadow-lg" />
              )}
              <div>
                <h2 className="font-sans text-2xl font-semibold">{playlist.name || playlist.title}</h2>
                <p className="text-muted-foreground text-sm max-w-xl">{playlist.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlist.tracks?.items ? playlist.tracks.items.slice(0, 9).map((item: any, i: number) => {
                const track = item.track;
                if (!track) return null;
                
                return (
                  <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group">
                    <div className="w-8 text-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                      {i + 1}
                    </div>
                    {track.album?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center"><Music size={16} className="text-muted-foreground"/></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artists?.[0]?.name}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  Mock data: Add your Spotify credentials to see real trending tracks here!
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
