import { UploadZone } from "@/components/UploadZone";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-73px)] w-full grid grid-cols-1 lg:grid-cols-2">
      {/* ── Left Hero Column ─────────────────────────────── */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-14 xl:px-20 bg-card relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="blob absolute top-[-5%] left-[-10%] w-80 h-80 bg-primary" />
        <div className="blob blob-delay-2 absolute bottom-[10%] right-[-5%] w-64 h-64 bg-cyan-400/60" />
        <div className="blob blob-delay-4 absolute top-[50%] left-[40%] w-48 h-48 bg-primary/70" />

        <div className="relative z-10 max-w-xl">
          {/* Pill badge */}
          <div className="pill fade-up mb-8">
            <span className="block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Multi-Stage AI Pipeline
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl lg:text-[3.75rem] xl:text-[4.5rem] leading-[1.05] mb-6 tracking-tight fade-up fade-up-delay-1">
            Find the perfect{" "}
            <span className="text-primary italic glow-text">
              song & caption
            </span>{" "}
            for your photo.
          </h1>

          {/* Sub-copy */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-md font-sans font-light leading-relaxed fade-up fade-up-delay-2">
            Upload your next Instagram post. We analyze its visual vibe and return currently trending songs with matching captions — ranked by predicted engagement.
          </p>

          {/* Feature rows */}
          <div className="flex flex-col gap-3 fade-up fade-up-delay-3">
            {[
              { icon: "🎨", label: "Vision analysis", desc: "Reads scene, lighting, and mood." },
              { icon: "🎵", label: "Spotify matching", desc: "Audio-feature distance scoring." },
              { icon: "✍️", label: "Caption ranking", desc: "Engagement-aware, cliché-free." },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground group">
                <span className="text-base w-7 shrink-0">{icon}</span>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">{label}</span>
                <span className="text-border mx-1">—</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Interaction Column ──────────────────────── */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-14 bg-background relative">
        {/* Subtle right-side blob */}
        <div className="blob blob-delay-2 absolute top-[20%] right-[-8%] w-64 h-64 bg-primary/25" />

        <div className="w-full max-w-xl mx-auto lg:mx-0 relative z-10">
          <div className="mb-8 fade-up">
            <h2 className="font-serif text-2xl mb-1">Start your Rollcall</h2>
            <p className="text-muted-foreground text-sm">Drop a photo or video, pick your language, hit go.</p>
          </div>
          
          <div className="fade-up fade-up-delay-1">
            <UploadZone />
          </div>
        </div>
      </div>
    </main>
  );
}
