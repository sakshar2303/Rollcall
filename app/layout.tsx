import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavHeader from "@/components/NavHeader";

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
        <NavHeader />
        {children}
      </body>
    </html>
  );
}
