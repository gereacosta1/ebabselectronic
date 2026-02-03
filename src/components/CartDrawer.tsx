// src/components/CartDrawer.tsx
import React from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useI18n } from "../i18n/I18nProvider";
import PayWithAffirm from "./PayWithAffirm";
import PayWithCard from "./PayWithCard";

const CartDrawer: React.FC = () => {
  const { t, fmtMoney } = useI18n();
  const { items, isOpen, close, removeItem, setQty, totalUSD, clear } = useCart();

  const handleDec = (id: string, qty: number) => setQty(id, Math.max(1, qty - 1));
  const handleInc = (id: string, qty: number) => setQty(id, qty + 1);

  const hasItems = items.length > 0 && totalUSD > 0;

  return (
    <div
      className={`fixed inset-0 z-[10000] ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#05010b] text-white 
                    shadow-[0_0_45px_rgba(0,0,0,0.85)]
                    border-l border-violet-600/30
                    transform transition-transform duration-300 ${
                      isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
        role="dialog"
        aria-label={t("cart.title")}
      >
        {/* header */}
        <header className="relative px-6 pt-6 pb-4 border-b border-violet-500/40 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-black/25 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-violet-100">
                  EBABS ELECTRONIC LLC
                </p>
                <h3 className="text-xl font-black leading-tight">{t("cart.title")}</h3>
              </div>
            </div>

            <button
              onClick={close}
              className="p-2 rounded-full bg-black/25 hover:bg-black/50 transition-colors"
              aria-label={t("modal.close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* mini total */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/25 px-4 py-1 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>
              {t("cart.total")}{" "}
              <span className="font-bold text-white">{fmtMoney(Number(totalUSD) || 0)}</span>
            </span>
          </div>
        </header>

        {/* contenido */}
        <div className="flex h-[calc(100%-190px)] flex-col">
          {/* items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {!items.length && (
              <p className="mt-6 text-sm text-zinc-400">{t("cart.empty")}</p>
            )}

            {items.map((it) => (
              <div
                key={it.id}
                className="flex gap-3 rounded-2xl bg-[#0b0718] border border-violet-800/50 p-3"
              >
                <img
                  src={it.image || "/fallback.png"}
                  alt={it.name}
                  className="w-20 h-20 object-cover rounded-xl border border-violet-500/40"
                  onError={(e) => {
                    const timg = e.currentTarget as HTMLImageElement;
                    if (!timg.src.endsWith("/fallback.png")) {
                      timg.src = "/fallback.png";
                    }
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{it.name}</p>
                      <p className="text-xs text-white/70">{fmtMoney(Number(it.price))}</p>
                    </div>

                    <button
                      onClick={() => removeItem(it.id)}
                      className="p-2 rounded-full bg-black/40 hover:bg-red-700/80 transition-colors"
                      title={t("cart.remove")}
                      aria-label={t("cart.remove")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleDec(it.id, it.qty)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15"
                      aria-label={t("cart.minus")}
                      title={t("cart.minus")}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="px-3 py-1 rounded-xl bg-white/5 font-bold">{it.qty}</span>

                    <button
                      onClick={() => handleInc(it.id, it.qty)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/15"
                      aria-label={t("cart.plus")}
                      title={t("cart.plus")}
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <span className="ml-auto text-sm font-bold">
                      {fmtMoney(Number(it.price) * Number(it.qty))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <footer className="border-t border-violet-700/40 px-6 py-4 space-y-3 bg-[#05010b]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                {t("cart.total")}
              </span>
              <span className="text-2xl font-black">{fmtMoney(Number(totalUSD) || 0)}</span>
            </div>

            {/* botones principales */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  onClick={clear}
                  disabled={!items.length}
                  className="flex-1 rounded-xl border border-zinc-700 bg-black/40 px-4 py-3 text-xs font-semibold 
                             text-zinc-200 hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("cart.clear")}
                </button>

                <div className="flex-1">
                  {hasItems ? (
                    <PayWithAffirm />
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-xs font-bold uppercase tracking-wide opacity-40 cursor-not-allowed"
                    >
                      {t("cart.payWithAffirm")}
                    </button>
                  )}
                </div>
              </div>

              {/* botón tarjeta */}
              <div>
                {hasItems ? (
                  <PayWithCard />
                ) : (
                  <button
                    disabled
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl 
                               bg-zinc-100 text-zinc-950 px-4 py-3 text-sm font-semibold 
                               opacity-60 cursor-not-allowed"
                  >
                    <CreditCard className="h-4 w-4" />
                    Pay by card (credit/debit)
                  </button>
                )}
              </div>
            </div>
          </footer>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
