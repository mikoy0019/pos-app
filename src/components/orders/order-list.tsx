"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/types";
import { toast } from "sonner";

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, profiles(username), order_items(*, products(name))")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) { toast.error("Failed to load orders"); }
    else setOrders(data as Order[]);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-card border border-white/6 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5">
        <div className="w-20 h-20 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h4"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground/40" style={{fontFamily:"var(--font-grotesk)"}}>No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1.5">Completed transactions will appear here</p>
        </div>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, Order[]> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    let label = d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(o);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateLabel, dayOrders]) => (
        <div key={dateLabel}>
          {/* Date group header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{dateLabel}</span>
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-[11px] text-muted-foreground font-price tabular-nums">
              ${dayOrders.reduce((s, o) => s + Number(o.total), 0).toFixed(2)}
            </span>
          </div>

          {/* Orders */}
          <div className="space-y-2">
            {dayOrders.map((order) => {
              const expanded = expandedId === order.id;
              const date = new Date(order.created_at);
              const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={order.id}
                  className={`rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer ${
                    expanded
                      ? "border-primary/25 bg-primary/5"
                      : "border-white/7 bg-card hover:border-white/14 hover:bg-white/3"
                  }`}
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                >
                  {/* Row */}
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    {/* Order ID */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      expanded ? "bg-primary/20 border border-primary/30" : "bg-white/5 border border-white/8"
                    }`}>
                      <span className="text-[11px] font-black font-price" style={{color: expanded ? "oklch(0.60 0.24 278)" : undefined}}>
                        #{order.id}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[13px] font-semibold capitalize">{order.profiles?.username ?? "Unknown"}</span>
                        <span className="text-[10px] text-muted-foreground bg-white/6 px-1.5 py-0.5 rounded-md font-price">
                          {order.order_items?.length ?? 0} items
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-price">{time}</p>
                    </div>

                    {/* Total */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[15px] font-black text-emerald-400 font-price tabular-nums">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      <div className={`w-5 h-5 rounded-full bg-white/6 flex items-center justify-center transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="border-t border-white/7 mx-4 mb-4">
                      <div className="pt-3 space-y-0">
                        {order.order_items?.map((item, idx) => (
                          <div key={item.id}
                            className={`flex items-center gap-3 py-2 text-sm ${idx < (order.order_items?.length ?? 0) - 1 ? "border-b border-white/5" : ""}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 font-price">
                              {item.qty}
                            </span>
                            <span className="flex-1 text-[13px] text-foreground/80">{item.products?.name}</span>
                            <span className="text-[11px] text-muted-foreground font-price tabular-nums">
                              ${Number(item.unit_price).toFixed(2)} ea
                            </span>
                            <span className="text-[13px] font-bold min-w-[48px] text-right font-price tabular-nums">
                              ${(Number(item.unit_price) * item.qty).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {/* Total row */}
                        <div className="flex justify-between items-center pt-2.5 border-t border-dashed border-white/10 mt-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total</span>
                          <span className="text-base font-black text-emerald-400 font-price tabular-nums">
                            ${Number(order.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
