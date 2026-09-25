import { UploadZone } from "@/components/UploadZone";

export default function Home() {
  return (
    <main className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column: Hero Copy & Aesthetics */}
      <div className="flex flex-col justify-center px-8 py-12 lg:px-16 xl:px-24 bg-card relative overflow-hidden">
        {/* Subtle background ambient blob */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center rounded-full border border-border bg-black/20 px-3 py-1 text-sm text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            AI-Powered Vibe Matching
          </div>
          
          <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] mb-6 tracking-tight text-foreground">
            Find the perfect <br />
            <span className="text-primary italic">song & caption</span>
            <br /> for your photo.
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-md font-sans font-light leading-relaxed">
            Upload your next Instagram post. We&apos;ll analyze its visual vibe and recommend currently trending songs and matching captions.
          </p>
        </div>
      </div>

      {/* Right Column: Interaction / Upload */}
      <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-background relative border-l border-border/50">
        <div className="w-full max-w-xl mx-auto lg:mx-0 relative z-10">
          <div className="mb-8">
            <h2 className="font-serif text-2xl mb-2">Start your Rollcall</h2>
            <p className="text-muted-foreground text-sm">Drop a photo here to kick off the multi-stage pipeline.</p>
          </div>
          
          <UploadZone />
        </div>
      </div>
    </main>
  );
}
