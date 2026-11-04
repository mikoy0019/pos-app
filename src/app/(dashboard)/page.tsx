"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, CartItem } from "@/lib/types";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { toast } from "sonner";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(false);
  // Mobile: which tab is shown — "products" | "cart"
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");
  const supabase = createClient();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products").select("*, categories(name)").order("name");
    if (error) { toast.error("Failed to load products"); return; }
    setProducts(data as Product[]);
    const cats = ["All", ...new Set(data.map((p: Product) => p.categories?.name ?? "Uncategorized"))];
    setCategories(cats);
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev; // Don't exceed available stock
        return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      if (product.stock <= 0) return prev; // Out of stock
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== productId));
    else setCart((prev) => prev.map((i) => {
      if (i.product.id === productId) {
        return { ...i, qty: Math.min(qty, i.product.stock) }; // Clamp to available stock
      }
      return i;
    }));
  }

  async function checkout() {
    if (!cart.length) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("place_order", {
        p_items: cart.map((i) => ({ product_id: i.product.id, qty: i.qty })),
      });
      if (error) throw error;
      const total = cart.reduce((s, i) => s + Number(i.product.price) * i.qty, 0);
      toast.success(`Order placed — $${total.toFixed(2)}`);
      setCart([]);
      setMobileTab("products");
      await loadProducts();
    } catch (err) {
      console.error("Checkout error:", err);
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)]">

      {/* ── Desktop / Tablet layout ── */}
      <div className="hidden md:grid md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] gap-3 p-3 h-full">
        {/* Product pane */}
        <div className="rounded-2xl border border-white/7 bg-card p-4 overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h2 className="text-[15px] font-bold tracking-tight" style={{fontFamily:"var(--font-grotesk)"}}>Products</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">{products.length} items available</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/4 border border-white/8 text-muted-foreground">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span className="text-[11px] hidden lg:block">Filter by category</span>
            </div>
          </div>
          <ProductGrid products={products} categories={categories} filter={filter} onFilterChange={setFilter} onAddToCart={addToCart} />
        </div>

        {/* Cart pane */}
        <CartPanel cart={cart} onUpdateQty={updateQty} onClear={() => setCart([])} onCheckout={checkout} loading={loading} />
      </div>

      {/* ── Mobile layout (tab-based) ── */}
      <div className="md:hidden flex flex-col h-full">

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === "products" ? (
            <div className="p-3 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div>
                  <h2 className="text-[15px] font-bold" style={{fontFamily:"var(--font-grotesk)"}}>Products</h2>
                  <p className="text-[11px] text-muted-foreground">{products.length} items</p>
                </div>
              </div>
              <ProductGrid products={products} categories={categories} filter={filter} onFilterChange={setFilter} onAddToCart={addToCart} />
            </div>
          ) : (
            <div className="p-3 h-full">
              <CartPanel cart={cart} onUpdateQty={updateQty} onClear={() => setCart([])} onCheckout={checkout} loading={loading} />
            </div>
          )}
        </div>

        {/* Mobile bottom tab bar */}
        <div className="shrink-0 border-t border-white/8 bg-background/95 backdrop-blur-xl grid grid-cols-2 px-4 py-2 pb-[env(safe-area-inset-bottom)] gap-2">
          <button
            onClick={() => setMobileTab("products")}
            className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mobileTab === "products"
                ? "bg-white/8 text-foreground border border-white/12"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>
            </svg>
            Products
          </button>
          <button
            onClick={() => setMobileTab("cart")}
            className={`relative flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
              mobileTab === "cart"
                ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white shadow-lg shadow-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            {cartCount > 0 && (
              <span className={`absolute -top-1 right-6 w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center ${
                mobileTab === "cart" ? "bg-white text-primary" : "bg-primary text-white"
              }`}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
