"use client";

import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  categories: string[];
  filter: string;
  onFilterChange: (cat: string) => void;
  onAddToCart: (product: Product) => void;
}

const PALETTES: Record<number, { bg: string; text: string }> = {
  0: { bg: "from-violet-600/30 via-violet-500/15 to-transparent", text: "text-violet-300" },
  1: { bg: "from-blue-600/30 via-blue-500/15 to-transparent", text: "text-blue-300" },
  2: { bg: "from-emerald-600/30 via-emerald-500/15 to-transparent", text: "text-emerald-300" },
  3: { bg: "from-amber-600/30 via-amber-500/15 to-transparent", text: "text-amber-300" },
  4: { bg: "from-rose-600/30 via-rose-500/15 to-transparent", text: "text-rose-300" },
  5: { bg: "from-cyan-600/30 via-cyan-500/15 to-transparent", text: "text-cyan-300" },
  6: { bg: "from-fuchsia-600/30 via-fuchsia-500/15 to-transparent", text: "text-fuchsia-300" },
  7: { bg: "from-orange-600/30 via-orange-500/15 to-transparent", text: "text-orange-300" },
};

function getPalette(name: string) { return PALETTES[name.charCodeAt(0) % 8]; }

function getEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cola") || n.includes("soda")) return "🥤";
  if (n.includes("water") || n.includes("aqua")) return "💧";
  if (n.includes("coffee") || n.includes("latte") || n.includes("espresso")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("juice") || n.includes("fruit")) return "🧃";
  if (n.includes("beer")) return "🍺";
  if (n.includes("wine")) return "🍷";
  if (n.includes("burger")) return "🍔";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("fries") || n.includes("chips")) return "🍟";
  if (n.includes("sandwich") || n.includes("sub")) return "🥪";
  if (n.includes("snack") || n.includes("popcorn")) return "🍿";
  if (n.includes("candy") || n.includes("sweet")) return "🍬";
  if (n.includes("choc")) return "🍫";
  if (n.includes("cake") || n.includes("pastry")) return "🍰";
  if (n.includes("ice cream")) return "🍦";
  if (n.includes("milk")) return "🥛";
  if (n.includes("egg")) return "🥚";
  if (n.includes("bread") || n.includes("toast")) return "🍞";
  const emojis = ["🛍️", "⭐", "💎", "🎯", "🔮", "✨", "🎪", "🎨"];
  return emojis[name.charCodeAt(0) % emojis.length];
}

export function ProductGrid({ products, categories, filter, onFilterChange, onAddToCart }: ProductGridProps) {
  const filtered = filter === "All"
    ? products
    : products.filter((p) => (p.categories?.name ?? "Uncategorized") === filter);

  return (
    <div className="flex flex-col gap-3 h-full overflow-hidden">

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {categories.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c} onClick={() => onFilterChange(c)}
              className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                active
                  ? "text-white border-primary/60 shadow-lg shadow-primary/20"
                  : "text-muted-foreground border-white/8 bg-white/4 hover:bg-white/8 hover:text-foreground hover:border-white/15"
              }`}
            >
              {active && <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />}
              <span className="relative">{c}</span>
            </button>
          );
        })}
        <span className="ml-auto text-[12px] text-muted-foreground font-medium tabular-nums">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid — responsive columns */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <div className="w-16 h-16 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center text-3xl">📦</div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/40">No products here</p>
            <p className="text-xs mt-1">Try a different category</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min gap-3 overflow-y-auto pb-2 flex-1">
          {filtered.map((p) => {
            const inStock = p.stock > 0;
            const palette = getPalette(p.name);
            const emoji = getEmoji(p.name);
            const lowStock = p.stock > 0 && p.stock <= 5;

            return (
              <button
                key={p.id}
                onClick={() => onAddToCart(p)}
                disabled={!inStock}
                className={`group relative flex flex-col rounded-2xl border overflow-hidden text-left transition-all duration-200 ${
                  inStock
                    ? "border-white/8 bg-card hover:border-white/18 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-none cursor-pointer"
                    : "border-white/5 bg-card/40 opacity-35 cursor-not-allowed"
                }`}
              >
                {/* Color zone */}
                <div className={`relative w-full h-20 sm:h-24 bg-gradient-to-b ${palette.bg} flex items-center justify-center overflow-hidden`}>
                  <span className="text-4xl sm:text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-lg select-none">
                    {emoji}
                  </span>
                  {lowStock && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-[9px] font-bold text-white">LOW</div>
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-2.5 py-2 border-t border-white/6">
                  <p className="text-[12px] sm:text-[13px] font-semibold leading-tight truncate text-foreground mb-1">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm sm:text-base font-bold font-price ${palette.text}`}>
                      ${Number(p.price).toFixed(2)}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md font-price ${
                      p.stock > 10 ? "bg-emerald-500/15 text-emerald-400"
                      : p.stock > 0 ? "bg-amber-500/15 text-amber-400"
                      : "bg-red-500/15 text-red-400"
                    }`}>
                      {p.stock}
                    </span>
                  </div>
                </div>

                {/* Active ring */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-active:opacity-100 ring-2 ring-primary/50 transition-opacity duration-75 pointer-events-none" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
