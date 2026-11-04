"use client";

import type { CartItem } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQty: (productId: number, qty: number) => void;
  onClear: () => void;
  onCheckout: () => void;
  loading: boolean;
}

export function CartPanel({ cart, onUpdateQty, onClear, onCheckout, loading }: CartPanelProps) {
  const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const tax = subtotal * 0.00; // set tax rate here if needed

  return (
    <div className="relative flex flex-col h-full rounded-2xl border border-white/8 bg-card overflow-hidden">

      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[13px] font-bold leading-none" style={{fontFamily:"var(--font-grotesk)"}}>Order</h2>
            {itemCount > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors px-2.5 py-1 rounded-lg hover:bg-destructive/10"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Items ── */}
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground/40" style={{fontFamily:"var(--font-grotesk)"}}>Cart is empty</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Tap any product on the left to add it to this order</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="px-3 py-2 space-y-1">
            {cart.map((item) => (
              <div key={item.product.id}
                className="flex items-center gap-3 p-2.5 rounded-xl group hover:bg-white/4 transition-colors"
              >
                {/* Qty badge */}
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-primary font-price">{item.qty}</span>
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate leading-tight">{item.product.name}</p>
                  <p className="text-[11px] text-muted-foreground font-price">${Number(item.product.price).toFixed(2)}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => onUpdateQty(item.product.id, item.qty - 1)}
                    className="w-6 h-6 rounded-lg bg-white/6 border border-white/8 hover:bg-white/12 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
                    −
                  </button>
                  <button onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                    className="w-6 h-6 rounded-lg bg-white/6 border border-white/8 hover:bg-white/12 flex items-center justify-center text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
                    +
                  </button>
                </div>

                {/* Line total */}
                <span className="text-[13px] font-bold min-w-[50px] text-right font-price tabular-nums">
                  ${(Number(item.product.price) * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* ── Receipt footer ── */}
      <div className="border-t border-white/6 shrink-0">
        {cart.length > 0 && (
          <div className="px-4 pt-3.5 pb-1 space-y-2">
            {/* Line items */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-price tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-muted-foreground">
                <span>Tax (0%)</span>
                <span className="font-price tabular-nums">${tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Dashed divider — receipt style */}
            <div className="border-t border-dashed border-white/10 my-2" />

            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold text-muted-foreground">Total</span>
              <span className="text-3xl font-black tracking-tight text-foreground font-price tabular-nums">
                ${(subtotal + tax).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Checkout */}
        <div className="px-4 pb-4 pt-3">
          <button
            onClick={onCheckout}
            disabled={cart.length === 0 || loading}
            className={`relative w-full h-12 rounded-xl font-bold text-[14px] overflow-hidden transition-all duration-200 flex items-center justify-center gap-2
              ${cart.length === 0 || loading
                ? "bg-white/6 text-muted-foreground cursor-not-allowed border border-white/6"
                : "text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            style={{fontFamily:"var(--font-grotesk)"}}
          >
            {cart.length > 0 && !loading && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
              </>
            )}
            <span className="relative flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Processing…
                </>
              ) : cart.length === 0 ? (
                "Checkout"
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pay ${(subtotal + tax).toFixed(2)}
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
