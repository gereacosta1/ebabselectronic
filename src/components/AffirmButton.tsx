// src/components/AffirmButton.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { loadAffirm } from "../lib/affirm";
import {
  buildAffirmCheckout,
  type CartItem as Item,
  type Customer,
} from "../lib/affirmCheckout";

type Props = {
  cartItems?: {
    name: string;
    sku?: string | number;
    price: number; // USD
    qty: number;
    url?: string;
    image?: string;
    id?: string | number;
  }[];
  totalUSD?: number;
  shippingUSD?: number;
  taxUSD?: number;
  customer?: Customer;
};

const MIN_TOTAL_CENTS = 5000; // $50 mínimo
const toCents = (usd = 0) => Math.round((Number(usd) || 0) * 100);

/* ---------- Toast simple ---------- */
function Toast({
  show,
  type,
  message,
  onClose,
}: {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;

  return (
    <div
      role="status"
      onClick={onClose}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold
      ${
        type === "success"
          ? "bg-green-600/95 text-white border-green-400"
          : type === "error"
          ? "bg-red-600/95 text-white border-red-400"
          : "bg-black/90 text-white border-white/20"
      }`}
    >
      {message}
    </div>
  );
}

function NiceModal({
  open,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="text-gray-700 mb-6">{children}</div>

        <div className="flex items-center justify-end gap-3">
          {secondaryLabel && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && (
            <button
              onClick={onPrimary}
              className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-900"
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AffirmButton({
  cartItems = [],
  totalUSD,
  shippingUSD = 0,
  taxUSD = 0,
  customer,
}: Props) {
  const PUBLIC_KEY = (import.meta.env.VITE_AFFIRM_PUBLIC_KEY || "").trim();
  const ENV = (import.meta.env.VITE_AFFIRM_ENV || "prod") as "prod" | "sandbox";

  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    type: "info" as "success" | "error" | "info",
    message: "",
  });
  const [modal, setModal] = useState({
    open: false,
    title: "",
    body: "",
    retry: false,
  });

  const showToast = (
    type: "success" | "error" | "info",
    message: string,
    ms = 2200
  ) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((s) => ({ ...s, show: false })), ms);
  };

  // Mapeo a formato affirmCheckout
  const mapped: Item[] = useMemo(
    () =>
      cartItems.map((it, i) => ({
        id: it.id ?? it.sku ?? i + 1,
        title: it.name,
        price: Number(it.price) || 0,
        qty: Math.max(1, Number(it.qty) || 1),
        url: it.url ?? "/",
        image: it.image,
      })),
    [cartItems]
  );

  const subtotalC = mapped.reduce(
    (acc, it) => acc + toCents(it.price) * it.qty,
    0
  );
  const shippingC = toCents(shippingUSD);
  const taxC = toCents(taxUSD);

  const totalC =
    typeof totalUSD === "number"
      ? toCents(totalUSD)
      : subtotalC + shippingC + taxC;

  // ✅ condiciones de pago
  const affirmEnabled = !!PUBLIC_KEY;;
  const canPay =
    affirmEnabled && ready && mapped.length > 0 && totalC >= MIN_TOTAL_CENTS;

  useEffect(() => {
    if (!PUBLIC_KEY) {
      setReady(false);
      return;
    }

    loadAffirm(PUBLIC_KEY, ENV)
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [PUBLIC_KEY, ENV]);

  async function handleClick() {
    const affirm = (window as any).affirm;

    if (!affirm?.checkout) {
      showToast("error", "Affirm is not ready yet");
      return;
    }

    if (!canPay) {
      const why =
        mapped.length === 0
          ? "Your cart is empty."
          : totalC < MIN_TOTAL_CENTS
          ? "The total is too low for Affirm (min $50)."
          : !ready
          ? "Affirm is still loading."
          : "Affirm is unavailable.";

      setModal({
        open: true,
        title: "Affirm unavailable",
        body: why,
        retry: !ready,
      });
      return;
    }

    const base = window.location.origin.replace("http://", "https://");

    const checkout = buildAffirmCheckout(
      mapped,
      { subtotalUSD: subtotalC / 100, shippingUSD, taxUSD },
      customer,
      base
    );

    setOpening(true);

    try {
      affirm.checkout(checkout);

      affirm.checkout.open({
        onSuccess: async ({ checkout_token }: { checkout_token: string }) => {
          try {
            const r = await fetch("/api/affirm-authorize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                checkout_token,
                order_id: "ORDER-" + Date.now(),
                amount_cents: totalC,
                capture: true,
              }),
            });

            const data = await r.json();
            console.log("[affirm-authorize]", data);

            if (!r.ok) {
              setModal({
                open: true,
                title: "Server error",
                body:
                  "Affirm opened successfully, but the server could not confirm the charge. Check Netlify function logs.",
                retry: true,
              });
              return;
            }

            showToast("success", "Affirm request submitted!");
          } catch (e) {
            setModal({
              open: true,
              title: "We could not confirm your request",
              body: "There was a problem confirming with the server.",
              retry: true,
            });
          } finally {
            setOpening(false);
          }
        },

        onFail: () => {
          setOpening(false);
          setModal({
            open: true,
            title: "Financing was not completed",
            body: "You can try again.",
            retry: true,
          });
        },

        onValidationError: () => {
          setOpening(false);
          setModal({
            open: true,
            title: "Invalid information",
            body: "Please check the buyer’s name and address.",
            retry: false,
          });
        },

        onClose: () => {
          setOpening(false);
          setModal({
            open: true,
            title: "Process canceled",
            body: "No charges were made. Would you like to try again?",
            retry: true,
          });
        },
      });
    } catch (e) {
      console.error(e);
      setOpening(false);
      showToast("error", "Could not open Affirm.");
    }
  }

  // ✅ IMPORTANTE: ahora siempre mostramos algo (para que se vea en el drawer)
  // Si falta key o está deshabilitado, mostramos disabled con explicación.
  const label = !affirmEnabled
    ? "Affirm (disabled)"
    : !ready
    ? "Loading Affirm…"
    : opening
    ? "Opening…"
    : "Pay with Affirm";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!affirmEnabled || opening || !canPay}
        className="w-full rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wide
                   bg-gradient-to-r from-sky-500 to-violet-500
                   hover:brightness-110 transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          !affirmEnabled
            ? "Missing VITE_AFFIRM_PUBLIC_KEY or Affirm disabled"
            : !ready
            ? "Affirm is loading"
            : !canPay
            ? "Minimum $50 and cart required"
            : "Pay with Affirm"
        }
      >
        {label}
      </button>

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((s) => ({ ...s, show: false }))}
      />

      <NiceModal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: "", body: "", retry: false })}
        secondaryLabel="Close"
        primaryLabel={modal.retry ? "Retry" : undefined}
        onPrimary={modal.retry ? handleClick : undefined}
      >
        {modal.body}
      </NiceModal>
    </>
  );
}
