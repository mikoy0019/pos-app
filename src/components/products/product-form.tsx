"use client";

import { useState, useEffect } from "react";
import type { Product, Category } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSave: (data: { name: string; price: number; stock: number; category_id: number | null }) => void;
}

export function ProductForm({ open, onOpenChange, product, categories, onSave }: ProductFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setCategoryId(product.category_id ? String(product.category_id) : "none");
    } else {
      setName(""); setPrice(""); setStock("0"); setCategoryId("none");
    }
  }, [product, open]);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    if (!name.trim()) return;
    if (isNaN(parsedPrice) || parsedPrice < 0) return;
    if (isNaN(parsedStock) || parsedStock < 0) return;
    onSave({ name: name.trim(), price: parsedPrice, stock: parsedStock, category_id: categoryId === "none" ? null : parseInt(categoryId) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-white/10 rounded-3xl shadow-2xl max-w-md p-0 overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-lg font-bold" style={{fontFamily:"var(--font-grotesk)"}}>
              {product ? "Edit Product" : "New Product"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {product ? "Update product details" : "Add a new item to your inventory"}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Product Name
              </label>
              <input
                id="name" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="e.g. Iced Latte"
                className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                  <input
                    id="price" type="number" step="0.01" min="0"
                    value={price} onChange={(e) => setPrice(e.target.value)} required
                    placeholder="0.00"
                    className="w-full h-11 pl-7 pr-4 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-price"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Stock
                </label>
                <input
                  id="stock" type="number" min="0"
                  value={stock} onChange={(e) => setStock(e.target.value)} required
                  placeholder="0"
                  className="w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all font-price"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Category
              </label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val ?? "none")}>
                <SelectTrigger className="h-11 rounded-xl border-white/10 bg-white/5 text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10 rounded-xl">
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button" onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl relative overflow-hidden text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{fontFamily:"var(--font-grotesk)"}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600" />
                <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
                <span className="relative">{product ? "Save Changes" : "Create Product"}</span>
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
