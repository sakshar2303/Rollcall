"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, Music, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // Preferences
  const [language, setLanguage] = useState("English");
  const [genre, setGenre] = useState("pop");

  const languages = ["English", "Spanish", "Hindi", "Korean", "Punjabi", "French", "Japanese"];
  const genres = ["pop", "hip-hop", "indie", "electronic", "r-n-b", "rock", "bollywood"];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    setFile(selectedFile);
    
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      formData.append("genre", genre);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      setUploadResult(data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
      <div 
        className={`relative w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center overflow-hidden
          ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-card/50 hover:bg-card hover:border-muted-foreground/50"}
          ${preview ? "border-transparent bg-transparent" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          accept="image/*"
          onChange={handleChange}
          disabled={isUploading}
        />
        
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div 
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 pointer-events-none"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-2">
                <UploadCloud size={32} />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Drag and drop your photo</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse from your device</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="image-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white font-medium mb-2">Click or drag to replace</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {preview && !uploadResult && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe size={14} /> Language
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isUploading}
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Music size={14} /> Vibe / Genre
                </label>
                <select 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-transform capitalize"
                  disabled={isUploading}
                >
                  {genres.map(g => <option key={g} value={g}>{g.replace('-', ' ')}</option>)}
                </select>
              </div>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="group relative flex w-full mt-4 h-14 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-primary-foreground font-medium text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none disabled:scale-100"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing Vibe...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={20} />
                  <span>Find My Song</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-4"
          >
            <div>
              <h3 className="font-serif text-xl mb-2 text-primary">1. Vision Extraction</h3>
              <pre className="text-xs text-muted-foreground overflow-auto p-3 bg-black/50 rounded-lg">
                {JSON.stringify(uploadResult.vision, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-serif text-xl mb-2 text-primary">2. Jev AI Vibe Classification</h3>
              <pre className="text-xs text-muted-foreground overflow-auto p-3 bg-black/50 rounded-lg">
                {JSON.stringify(uploadResult.classification, null, 2)}
              </pre>
            </div>
            
            {uploadResult.songs && (
              <div>
                <h3 className="font-serif text-xl mb-2 text-primary">3. Spotify Song Matches</h3>
                <div className="flex flex-col gap-2">
                  {uploadResult.songs.map((song: any, i: number) => (
                    <div key={song.spotifyId || i} className="flex items-center gap-3 bg-black/30 p-2 rounded-lg">
                      {song.albumArt && <img src={song.albumArt} alt={song.title} className="w-10 h-10 rounded-md" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="text-right text-[10px] text-muted-foreground flex flex-col items-end">
                        <span title="Energy Match">⚡ {song.trackEnergy} / {song.targetEnergy}</span>
                        <span title="Valence Match">🎵 {song.trackValence} / {song.targetValence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => {
                setUploadResult(null);
                setPreview(null);
                setFile(null);
              }}
              className="mt-4 py-3 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            >
              Start Over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
