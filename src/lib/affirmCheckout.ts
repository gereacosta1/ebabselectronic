// src/lib/affirmCheckout.ts
export type CartItem = {
  id: string | number;
  title: string;
  price: number; // USD
  qty: number;
  image?: string; // /img/xxx.jpg
  url?: string; // /product/xxx
};

export type Totals = {
  subtotalUSD: number;
  shippingUSD?: number;
  taxUSD?: number;
};

export type Customer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  // phone?: string; // opcional, no lo mandamos por defecto
  address?: {
    line1?: string;
    city?: string;
    state?: string; // "FL"
    zip?: string; // "33127"
    country?: string; // "US"
  };
};

const toCents = (usd = 0) => Math.round((Number(usd) || 0) * 100);

const isUSState = (v?: string) => !!v && /^[A-Z]{2}$/.test(v.toUpperCase());
const isUSZip = (v?: string) => !!v && /^\d{5}(-\d{4})?$/.test(v);
const isCountryUS = (v?: string) => (v || "").toUpperCase() === "US";

function hasFullUSAddress(c?: Customer) {
  const a = c?.address;
  if (!a) return false;
  return (
    !!a.line1 &&
    !!a.city &&
    isUSState(a.state) &&
    isUSZip(a.zip) &&
    isCountryUS(a.country || "US")
  );
}

function buildName(c?: Customer) {
  const first = (c?.firstName || "").trim();
  const last = (c?.lastName || "").trim();
  if (first || last) return { first: first || "Customer", last: last || "Online" };
  // Si no hay nombre, lo omitimos y que Affirm lo pida en el modal
  return null;
}

function buildAddress(c?: Customer) {
  const a = c?.address || {};
  return {
    line1: String(a.line1 || "").trim(),
    city: String(a.city || "").trim(),
    state: String(a.state || "").trim().toUpperCase(),
    zipcode: String(a.zip || "").trim(),
    country: String(a.country || "US").trim().toUpperCase(),
  };
}

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer?: Customer,
  merchantBase = window.location.origin
) {
  const mapped = items.map((p, idx) => ({
    display_name: (p.title || `Item ${idx + 1}`).toString().slice(0, 120),
    sku: String(p.id),
    unit_price: toCents(p.price),
    qty: Math.max(1, Number(p.qty) || 1),
    item_url: p.url?.startsWith("http") ? p.url : merchantBase + (p.url || "/"),
    image_url: p.image
      ? p.image.startsWith("http")
        ? p.image
        : merchantBase + p.image
      : undefined,
  }));

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC = subtotalC + shippingC + taxC;

  const payload: any = {
    merchant: {
      user_confirmation_url: merchantBase + "/affirm/confirm.html",
      user_cancel_url: merchantBase + "/affirm/cancel.html",
      user_confirmation_url_action: "GET",
      name: "EBABS ELECTRONIC LLC",
    },
    items: mapped,
    currency: "USD",
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: "modal" },
  };

  // Solo mandamos billing/shipping si el customer tiene dirección REAL completa.
  // Si no, Affirm lo va a pedir en el modal (mejor que mandar una dirección fake).
  if (hasFullUSAddress(customer)) {
    const name = buildName(customer) || { first: "Customer", last: "Online" };
    const addr = buildAddress(customer);

    payload.billing = { name, address: addr };
    payload.shipping = { name, address: addr };
  } else {
    const name = buildName(customer);
    if (name) {
      // Si hay nombre pero no hay address, mandamos nombre solo
      payload.billing = { name };
      payload.shipping = { name };
    }
  }

  return payload;
}
