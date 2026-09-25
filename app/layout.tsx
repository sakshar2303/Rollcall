import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rollcall | AI-Powered Photo & Song Recommender",
  description: "Find the perfect song and caption for your Instagram photo based on its vibe.",
};

function Header() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-6 border-b border-border/50 bg-background z-50">
      <Link href="/" className="font-serif text-2xl tracking-tight hover:text-primary transition-colors">
        Rollcall<span className="text-primary text-3xl leading-none">.</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Upload
        </Link>
        <Link href="/trending" className="text-muted-foreground hover:text-foreground transition-colors">
          Trending Now
        </Link>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Header />
        {children}
      </body>
    </html>
  );
}
