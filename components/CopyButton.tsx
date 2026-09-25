"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy caption"}
      className={`p-1.5 rounded-full transition-all duration-200 ${
        copied
          ? "text-green-400 bg-green-400/15"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      } ${className}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
