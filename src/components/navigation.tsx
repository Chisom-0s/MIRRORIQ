"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/analyze", label: "Analyze" },
    { href: "/workspace", label: "Workspace" },
    { href: "/results", label: "Results" },
    { href: "/compare", label: "Compare" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm tracking-tighter transition-transform group-hover:scale-105 shadow-sm">
            M<span className="text-amber-300 font-serif italic text-xs">IQ</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-neutral-950">
              MirrorIQ
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest text-neutral-500">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? "text-neutral-950 font-semibold"
                    : "hover:text-neutral-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-950 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-neutral-950 text-white px-4 py-2 text-xs font-medium tracking-wide uppercase rounded-md hover:bg-neutral-800 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Analyze Product
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 bg-neutral-950 text-white px-3 py-1.5 text-xs font-medium rounded-md"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            Start
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-neutral-700 hover:text-neutral-950 rounded-md focus:outline-none"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm py-2 px-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-neutral-100 font-semibold text-neutral-950"
                      : "text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-neutral-100">
            <Link
              href="/analyze"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 text-white py-2.5 text-xs font-medium uppercase tracking-wide rounded-md"
            >
              Start Full Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50/50 py-8 px-6 text-center text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-neutral-600 font-medium">
          <span>MirrorIQ</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-400 font-normal">Visual Purchase Decision Engine</span>
        </div>
        <p className="text-[11px] text-neutral-400">
          Decision scores generated by MirrorIQ algorithms. Powered by visual intelligence.
        </p>
      </div>
    </footer>
  );
}
