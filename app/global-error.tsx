"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#fafafa] font-sans">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              An unexpected error occurred. This has been logged automatically.
            </p>
            {error.digest && (
              <p className="text-xs text-[#71717a] mt-2 font-mono">Ref: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d9f96b] text-[#09090b] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
