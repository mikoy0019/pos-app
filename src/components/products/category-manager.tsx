"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string) => void;
}

export function CategoryManager({ categories, onAdd }: CategoryManagerProps) {
  const [name, setName] = useState("");

  function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className="h-9 flex-1 max-w-xs px-3.5 rounded-xl border border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          type="submit"
          className="h-9 px-4 rounded-xl border border-white/10 bg-white/6 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/12 hover:border-white/18 transition-all"
        >
          Add
        </button>
      </form>

      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/12 text-primary border border-primary/20"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
