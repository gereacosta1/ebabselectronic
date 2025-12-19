// netlify/functions/card-checkout.mjs
import Stripe from "stripe";

// ENV requerida:
// - STRIPE_SECRET_KEY = sk_live_...

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" })
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    if (!stripe) return json(500, { error: "Missing STRIPE_SECRET_KEY env var" });

    const body = JSON.parse(event.body || "{}");
    const items = Array.isArray(body.items) ? body.items : [];

    const fallbackOrigin = "https://ebabselectronic.com";
    const origin =
      typeof body.origin === "string" && body.origin.startsWith("http")
        ? body.origin
        : fallbackOrigin;

    const customer_email =
      typeof body.customer_email === "string" && body.customer_email.includes("@")
        ? body.customer_email
        : undefined;

    if (!items.length) return json(400, { error: "items array required" });

    const line_items = items.map((it, index) => {
      const name = (it.name || `Item ${index + 1}`).toString().slice(0, 120);
      const unitAmount = Math.round(Number(it.price || 0) * 100);
      const safeUnitAmount =
        Number.isFinite(unitAmount) && unitAmount >= 50 ? unitAmount : 50; // min seguro

      const qty = Math.max(1, Number(it.qty) || 1);

      return {
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount: safeUnitAmount,
        },
        quantity: qty,
      };
    });

    // ✅ Lo más estable: automatic_payment_methods
    // Stripe decide qué mostrar (card + BNPL elegibles: Klarna/Afterpay/etc.)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,

      automatic_payment_methods: { enabled: true },

      // Aumenta elegibilidad BNPL (especialmente Afterpay/Klarna)
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },

      customer_email,

      success_url: `${origin}/?card=success`,
      cancel_url: `${origin}/?card=cancel`,
    });

    console.log("[stripe checkout session]", safe({ id: session.id, url: session.url }));
    return json(200, { ok: true, url: session.url });
  } catch (err) {
    console.error("[card-checkout] error", err);

    const msg =
      (err && err.message) ||
      (err && err.raw && err.raw.message) ||
      "server_error";

    const code = err && (err.code || (err.raw && err.raw.code));
    return json(500, { error: msg, code: code || null });
  }
}
