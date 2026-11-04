"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/lib/types";
import { ProductForm } from "@/components/products/product-form";
import { CategoryManager } from "@/components/products/category-manager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { checkRole(); loadProducts(); loadCategories(); }, []);

  async function checkRole() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin") setAuthorized(true);
    setLoading(false);
  }

  async function loadProducts() {
    const { data } = await supabase.from("products").select("*, categories(name)").order("name");
    if (data) setProducts(data as Product[]);
  }

  async function loadCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data as Category[]);
  }

  async function handleSave(data: { name: string; price: number; stock: number; category_id: number | null }) {
    if (editProduct) {
      const { error } = await supabase.from("products").update(data).eq("id", editProduct.id);
      if (error) { toast.error("Failed to update product"); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(data);
      if (error) { toast.error("Failed to create product"); return; }
      toast.success("Product created");
    }
    setFormOpen(false); setEditProduct(null); loadProducts();
  }

  async function handleDelete() {
    if (deleteId === null) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) toast.error("Failed to delete product");
    else toast.success("Product deleted");
    setDeleteId(null); loadProducts();
  }

  async function handleAddCategory(name: string) {
    const { error } = await supabase.from("categories").insert({ name });
    if (error) { toast.error("Failed to create category"); return; }
    toast.success("Category created"); loadCategories();
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-5 space-y-3 max-w-5xl mx-auto">
        <div className="h-8 w-40 rounded-xl bg-card animate-pulse" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-2xl bg-card animate-pulse" />)}
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-3.5rem)] gap-5 px-4 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-destructive/60">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div>
          <p className="text-base font-bold text-foreground/40" style={{fontFamily:"var(--font-grotesk)"}}>Admin access required</p>
          <p className="text-sm text-muted-foreground mt-1.5">This page is restricted to administrators</p>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce((s, p) => s + Number(p.price) * p.stock, 0);
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{fontFamily:"var(--font-grotesk)"}}>Products</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {products.length} items · ${totalValue.toFixed(2)} value
            </p>
          </div>
          <button
            onClick={() => { setEditProduct(null); setFormOpen(true); }}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-primary/25 shrink-0"
            style={{fontFamily:"var(--font-grotesk)"}}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="relative">Add Product</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Products", value: products.length, icon: "📦", color: "text-violet-400" },
            { label: "Out of Stock", value: outOfStock, icon: "⚠️", color: "text-amber-400" },
            { label: "Categories", value: categories.length, icon: "🏷️", color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/7 bg-card px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl">{stat.icon}</span>
              <div>
                <p className={`text-lg sm:text-xl font-black font-price tabular-nums ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Categories ── */}
        <div className="rounded-2xl border border-white/7 bg-card p-3 sm:p-4">
          <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Categories</h2>
          <CategoryManager categories={categories} onAdd={handleAddCategory} />
        </div>

        {/* ── Products — Desktop table / Mobile cards ── */}
        <div className="rounded-2xl border border-white/7 bg-card overflow-hidden">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center text-2xl">📦</div>
              <div className="text-center px-4">
                <p className="text-sm font-semibold text-foreground/40">No products yet</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Add Product" to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-[1fr_130px_90px_70px_110px] border-b border-white/7 px-5 py-2.5">
                  {["Name", "Category", "Price", "Stock", "Actions"].map((h, i) => (
                    <div key={h} className={`text-[10px] font-bold text-muted-foreground uppercase tracking-widest ${i >= 2 ? "text-right" : ""}`}>{h}</div>
                  ))}
                </div>
                {products.map((p, idx) => (
                  <div key={p.id}
                    className={`grid grid-cols-[1fr_130px_90px_70px_110px] items-center px-5 py-3.5 hover:bg-white/3 transition-colors ${idx < products.length - 1 ? "border-b border-white/5" : ""}`}
                  >
                    <div className="font-semibold text-sm pr-4 truncate">{p.name}</div>
                    <div>
                      {p.categories?.name
                        ? <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/12 text-primary border border-primary/20">{p.categories.name}</span>
                        : <span className="text-xs text-muted-foreground/50">—</span>
                      }
                    </div>
                    <div className="text-right font-bold text-sm font-price tabular-nums">${Number(p.price).toFixed(2)}</div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg font-price ${
                        p.stock > 10 ? "bg-emerald-500/12 text-emerald-400"
                        : p.stock > 0 ? "bg-amber-500/12 text-amber-400"
                        : "bg-red-500/12 text-red-400"
                      }`}>{p.stock}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setEditProduct(p); setFormOpen(true); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/6 border border-white/8 hover:bg-white/12 transition-all">
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/8 border border-destructive/15 text-destructive hover:bg-destructive/18 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile cards — hidden on desktop */}
              <div className="sm:hidden divide-y divide-white/5">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                    {/* Emoji thumb */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${PALETTES[p.name.charCodeAt(0) % 8]}`}>
                      {getEmoji(p.name)}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold font-price text-primary">${Number(p.price).toFixed(2)}</span>
                        {p.categories?.name && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/12 text-primary border border-primary/20">{p.categories.name}</span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md font-price ml-auto ${
                          p.stock > 10 ? "bg-emerald-500/12 text-emerald-400"
                          : p.stock > 0 ? "bg-amber-500/12 text-amber-400"
                          : "bg-red-500/12 text-red-400"
                        }`}>{p.stock} left</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => { setEditProduct(p); setFormOpen(true); }}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/6 border border-white/8 hover:bg-white/12 transition-all">
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-destructive/8 border border-destructive/15 text-destructive hover:bg-destructive/18 transition-all">
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <ProductForm open={formOpen} onOpenChange={setFormOpen} product={editProduct} categories={categories} onSave={handleSave} />

        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="bg-card border-white/10 rounded-3xl shadow-2xl mx-4">
            <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-600 -mt-1 rounded-t-3xl mb-4" />
            <AlertDialogHeader>
              <AlertDialogTitle style={{fontFamily:"var(--font-grotesk)"}}>Delete Product?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Needed for mobile product cards
const PALETTES: Record<number, string> = {
  0: "from-violet-600/20 to-violet-600/5",
  1: "from-blue-600/20 to-blue-600/5",
  2: "from-emerald-600/20 to-emerald-600/5",
  3: "from-amber-600/20 to-amber-600/5",
  4: "from-rose-600/20 to-rose-600/5",
  5: "from-cyan-600/20 to-cyan-600/5",
  6: "from-fuchsia-600/20 to-fuchsia-600/5",
  7: "from-orange-600/20 to-orange-600/5",
};

function getEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cola") || n.includes("soda")) return "🥤";
  if (n.includes("water")) return "💧";
  if (n.includes("coffee") || n.includes("latte")) return "☕";
  if (n.includes("tea")) return "🍵";
  if (n.includes("juice")) return "🧃";
  if (n.includes("burger")) return "🍔";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("fries")) return "🍟";
  if (n.includes("snack")) return "🍿";
  if (n.includes("choc") || n.includes("candy")) return "🍫";
  const e = ["🛍️","⭐","💎","🎯","🔮","✨","🎪","🎨"];
  return e[name.charCodeAt(0) % e.length];
}
