"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    window.location.href = "/";
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-60 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/6 blur-[80px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{backgroundImage:"linear-gradient(oklch(1 0 0) 1px,transparent 1px),linear-gradient(90deg,oklch(1 0 0) 1px,transparent 1px)",backgroundSize:"48px 48px"}}
      />

      <div className="relative z-10 w-full max-w-[400px] px-4">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-2xl bg-primary blur-xl opacity-50 scale-110" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground" style={{fontFamily:"var(--font-grotesk)"}}>
            NexPOS
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 tracking-wide">
            Point of Sale · Next Generation
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl border border-white/8 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden p-7">
          {/* Subtle top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <h2 className="text-lg font-semibold mb-1" style={{fontFamily:"var(--font-grotesk)"}}>Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                id="email" name="email" type="email"
                placeholder="admin@pos.local" required
                className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:bg-white/8 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="password" name="password" type="password"
                placeholder="••••••••" required
                className="w-full h-11 px-4 rounded-xl border border-white/8 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:bg-white/8 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="relative w-full h-11 mt-2 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="absolute inset-0 shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/50 transition-shadow duration-200" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Demo accounts — only visible in development */}
          {process.env.NODE_ENV === "development" && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/6" />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Demo</span>
                <div className="flex-1 h-px bg-white/6" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { role: "Admin", email: "admin@pos.local", pass: "admin123", color: "from-violet-500/20 to-indigo-500/10 border-violet-500/20", badge: "text-violet-300 bg-violet-500/20" },
                  { role: "Cashier", email: "cashier@pos.local", pass: "cashier123", color: "from-slate-500/10 to-slate-600/5 border-white/8", badge: "text-slate-400 bg-white/8" },
                ].map((acc) => (
                  <div key={acc.role} className={`p-3 rounded-2xl bg-gradient-to-br border ${acc.color}`}>
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${acc.badge}`}>
                      {acc.role}
                    </span>
                    <p className="text-[11px] text-foreground/70 font-medium leading-relaxed" style={{fontFamily:"var(--font-mono)"}}>
                      {acc.email}<br />
                      <span className="text-muted-foreground">{acc.pass}</span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40 mt-6 tracking-wide">
          NexPOS · Powered by Supabase & Vercel
        </p>
      </div>
    </div>
  );
}
