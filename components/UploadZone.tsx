"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Loader2, Music, Globe, Info, ThumbsUp, ThumbsDown } from "lucide-react";
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
  
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null);

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
    setExpandedDetails(null);
    
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
            className="flex flex-col gap-8"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">Detected Vibe</p>
                <h3 className="font-serif text-3xl capitalize text-primary">
                  {uploadResult.classification.choice} 
                  <span className="text-foreground text-lg ml-2 opacity-50">Energy: {uploadResult.classification.score}/5</span>
                </h3>
              </div>
              <button 
                onClick={() => { setUploadResult(null); setPreview(null); setFile(null); }}
                className="text-sm font-medium border border-border px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Song Recommendations */}
            {uploadResult.songs && uploadResult.songs.length > 0 && (
              <div className="flex flex-col gap-4">
                <h4 className="font-sans font-semibold text-lg flex items-center gap-2">
                  <Music size={18} /> Recommended Tracks
                </h4>
                
                <div className="flex flex-col gap-3">
                  {uploadResult.songs.map((song: any, i: number) => (
                    <motion.div 
                      key={song.spotifyId || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card border border-border p-3 rounded-xl hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {song.albumArt ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={song.albumArt} alt={song.title} className="w-14 h-14 rounded-md object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center"><Music size={20} className="text-muted-foreground"/></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base truncate">{song.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                            onClick={() => setExpandedDetails(expandedDetails === song.spotifyId ? null : song.spotifyId)}
                          >
                            <Info size={16} />
                          </button>
                          <button className="p-2 text-muted-foreground hover:text-green-400 hover:bg-green-400/10 rounded-full transition-colors"><ThumbsUp size={16} /></button>
                          <button className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"><ThumbsDown size={16} /></button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedDetails === song.spotifyId && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-foreground">Matched because:</span><br/>
                                Energy: {song.trackEnergy} vs target {song.targetEnergy}<br/>
                                Valence: {song.trackValence} vs target {song.targetValence}
                              </div>
                              {song.previewUrl && (
                                <div className="flex flex-col items-end justify-center">
                                  <audio controls src={song.previewUrl} className="h-8 w-full max-w-[200px]" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Caption Recommendations */}
            {uploadResult.captions && uploadResult.captions.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <h4 className="font-sans font-semibold text-lg flex items-center gap-2">
                  <ImageIcon size={18} /> Caption Options
                </h4>
                
                <div className="grid gap-3">
                  {uploadResult.captions.map((caption: any, i: number) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="bg-card border border-border p-4 rounded-xl flex flex-col gap-3 group hover:border-primary/50 transition-colors"
                    >
                      <p className="text-lg text-foreground leading-relaxed font-serif">"{caption.text}"</p>
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium capitalize">
                            {caption.toneCategory}
                          </span>
                          <span className="text-muted-foreground">
                            Score: {caption.predictedEngagementScore.toFixed(1)}/10
                          </span>
                        </div>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-muted-foreground hover:text-green-400 hover:bg-green-400/10 rounded-full transition-colors"><ThumbsUp size={14} /></button>
                          <button className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"><ThumbsDown size={14} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
