"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const NAV_LINKS = [
  {
    href: "/", label: "Register",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
      </svg>
    ),
  },
  {
    href: "/orders", label: "Orders",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h4"/>
      </svg>
    ),
  },
];

const ADMIN_LINK = {
  href: "/products", label: "Products",
  icon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),
};

export function Navbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = profile.role === "admin" ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-14 flex items-center px-4 md:px-5 gap-3 border-b border-white/6 bg-background/90 backdrop-blur-2xl shrink-0">
        {/* Top hairline */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-300">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight hidden sm:block" style={{fontFamily:"var(--font-grotesk)"}}>
            NexPOS
          </span>
        </Link>

        {/* Desktop separator */}
        <div className="hidden md:block w-px h-5 bg-white/8 shrink-0" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {active && <div className="absolute inset-0 rounded-xl bg-white/8 border border-white/10" />}
                <span className={`relative transition-colors ${active ? "text-primary" : ""}`}>{link.icon}</span>
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop user pill */}
        <div className="hidden sm:flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl border border-white/8 bg-white/4">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 ${
            profile.role === "admin" ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
          }`}>
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-[13px] font-medium leading-none hidden md:block">{profile.username}</span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md hidden md:block ${
            profile.role === "admin" ? "bg-violet-500/20 text-violet-300" : "bg-white/8 text-muted-foreground"
          }`}>
            {profile.role}
          </span>
        </div>

        {/* Desktop logout */}
        <button onClick={handleLogout}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/6 border border-transparent hover:border-white/8 transition-all duration-200"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="hidden lg:block">Logout</span>
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/8 bg-white/4 text-muted-foreground hover:text-foreground transition-colors"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden fixed top-14 inset-x-0 z-40 border-b border-white/8 bg-background/95 backdrop-blur-2xl p-4 space-y-1">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white ${
              profile.role === "admin" ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-gradient-to-br from-slate-600 to-slate-700"
            }`}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{profile.username}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>
          <div className="h-px bg-white/8 mb-2" />

          {/* Nav links */}
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-white/8 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <span className={active ? "text-primary" : ""}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}

          <div className="h-px bg-white/8 my-1" />
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </>
  );
}
