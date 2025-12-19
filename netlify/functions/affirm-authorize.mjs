// netlify/functions/affirm-authorize.mjs
// API v2: crea el charge desde checkout_token y (opcional) captura el pago.
//
// ENV requeridas en Netlify:
// - AFFIRM_PUBLIC_KEY  (o AFFIRM_PUBLIC_API_KEY)
// - AFFIRM_PRIVATE_KEY (o AFFIRM_PRIVATE_API_KEY)
// - AFFIRM_ENV = "prod" | "production" | "sandbox"  (opcional; default sandbox si no es prod)

const envRaw = String(
  process.env.AFFIRM_ENV || process.env.VITE_AFFIRM_ENV || ""
).toLowerCase();

const isProd = envRaw === "prod" || envRaw === "production";

// Base v2 (prod / sandbox)
const BASE = isProd
  ? "https://api.affirm.com/api/v2"
  : "https://api.sandbox.affirm.com/api/v2";

// (Opcional) si querés restringir CORS a tu dominio,
// seteá ALLOWED_ORIGINS="https://ebabselectronic.com,https://xxx.netlify.app"
const allowedOriginsEnv = String(process.env.ALLOWED_ORIGINS || "").trim();
const allowedOrigins = allowedOriginsEnv
  ? allowedOriginsEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : null;

function corsHeaders(origin) {
  const allowOrigin =
    !allowedOrigins
      ? "*"
      : allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0] || "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

const CAPTURE_DEFAULT = true;

// Logging seguro (recorta)
const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
};

export async function handler(event) {
  const origin = event.headers?.origin || "";
  const CORS = corsHeaders(origin);

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // 🔎 Diagnóstico rápido (no llama a Affirm)
    if (body && body.diag === true) {
      const diag = {
        envRaw: envRaw || null,
        isProd,
        baseURL: BASE,
        nodeVersion: process.versions?.node,
        flags: {
          HAS_AFFIRM_PUBLIC_KEY: Boolean(
            process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY
          ),
          HAS_AFFIRM_PRIVATE_KEY: Boolean(
            process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY
          ),
          HAS_VITE_AFFIRM_PUBLIC_KEY: Boolean(process.env.VITE_AFFIRM_PUBLIC_KEY),
          HAS_ALLOWED_ORIGINS: Boolean(allowedOriginsEnv),
        },
      };
      return json(200, { ok: true, diag }, CORS);
    }

    const {
      checkout_token,
      order_id,
      amount_cents,
      amount, // ✅ compat: algunos callers mandan amount
      currency,
      shipping_carrier,
      shipping_confirmation,
      capture,
    } = body || {};

    if (typeof checkout_token !== "string" || !checkout_token.trim()) {
      return json(400, { error: "Missing checkout_token" }, CORS);
    }
    if (typeof order_id !== "string" || !order_id.trim()) {
      return json(400, { error: "Missing order_id" }, CORS);
    }

    // Llaves (dos variantes por si cambian los nombres en Netlify)
    const PUB =
      process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY || "";
    const PRIV =
      process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || "";

    if (!PUB || !PRIV) {
      return json(
        500,
        { error: "Missing AFFIRM keys (AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY)" },
        CORS
      );
    }

    // Auth correcto: usuario = PUBLIC, password = PRIVATE
    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Autorizar (crear charge desde checkout_token)
    const authRes = await fetch(`${BASE}/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token: checkout_token.trim() }),
    });

    const charge = await tryJson(authRes);
    console.log("[affirm charges]", {
      env: isProd ? "prod" : "sandbox",
      status: authRes.status,
      resp: safe(charge),
    });

    if (!authRes.ok) {
      return json(authRes.status, { step: "charges", error: charge }, CORS);
    }

    // 2) Capturar si corresponde
    const shouldCapture =
      typeof capture === "boolean" ? capture : CAPTURE_DEFAULT;

    let captureResp = null;

    if (shouldCapture) {
      // ✅ acepta amount_cents o amount
      const rawAmt =
        typeof amount_cents === "number" ? amount_cents : amount;

      if (typeof rawAmt !== "number" || !Number.isFinite(rawAmt)) {
        return json(
          400,
          {
            error:
              "amount_cents (number) or amount (number) required for capture=true",
          },
          CORS
        );
      }

      const amt = Math.round(rawAmt);
      if (amt <= 0) {
        return json(400, { error: "amount must be > 0" }, CORS);
      }

      // Currency: opcional, pero logueamos si viene
      const cur = typeof currency === "string" ? currency.trim().toUpperCase() : "USD";

      const capRes = await fetch(
        `${BASE}/charges/${encodeURIComponent(charge.id)}/capture`,
        {
          method: "POST",
          headers: { Authorization: AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order_id.trim(),
            amount: amt, // centavos
            currency: cur, // no siempre es requerido; si Affirm lo ignora, ok
            shipping_carrier,
            shipping_confirmation,
          }),
        }
      );

      captureResp = await tryJson(capRes);
      console.log("[affirm capture]", {
        status: capRes.status,
        resp: safe(captureResp),
      });

      if (!capRes.ok) {
        return json(
          capRes.status,
          { step: "capture", error: captureResp },
          CORS
        );
      }
    }

    return json(200, { ok: true, charge, capture: captureResp }, CORS);
  } catch (e) {
    console.error("[affirm-authorize] error", e);
    return json(500, { error: "server_error" }, CORS);
  }
}

/* ---------------- Helpers ---------------- */
async function tryJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
function json(statusCode, obj, cors) {
  return {
    statusCode,
    headers: { ...(cors || {}), "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}
