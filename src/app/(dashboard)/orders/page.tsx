import { OrderList } from "@/components/orders/order-list";

export default function OrdersPage() {
  return (
    <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-5 py-4 sm:py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6m-6 4h4"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none" style={{fontFamily:"var(--font-grotesk)"}}>
              Sales History
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Tap any order to expand details</p>
          </div>
        </div>

        <OrderList />
      </div>
    </div>
  );
}
