"use client";

import { useState, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

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
    
    // Create preview
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="group relative flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-primary-foreground font-medium text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
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
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <h3 className="font-serif text-2xl mb-4">Vision Analysis Result</h3>
            <pre className="text-sm text-muted-foreground overflow-auto p-4 bg-black/50 rounded-xl">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
