"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music } from "lucide-react";

const navLinks = [
  { href: "/", label: "Upload" },
  { href: "/trending", label: "Trending Now" },
];

export default function NavHeader() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full glass border-b border-white/[0.06]"
      style={{ minHeight: "64px" }}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-serif text-xl tracking-tight transition-opacity hover:opacity-80"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Music size={14} strokeWidth={2.5} />
          </span>
          <span>
            Rollcall
            <span className="text-primary text-2xl leading-none glow-text">.</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isActive
                    ? "text-foreground bg-white/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
