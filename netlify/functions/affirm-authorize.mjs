// netlify/functions/affirm-authorize.mjs
// API v2: crea el charge desde checkout_token y (opcional) captura el pago.
//
// ENV requeridas en Netlify:
// - AFFIRM_PUBLIC_KEY  (o AFFIRM_PUBLIC_API_KEY)
// - AFFIRM_PRIVATE_KEY (o AFFIRM_PRIVATE_API_KEY)
// - AFFIRM_ENV = "prod" | "production" | "sandbox"  (opcional; default sandbox si no es prod)
//
// (Opcional recomendado)
// - DIAG_SECRET: si existe, exige header "x-diag-secret" para diag remoto

const envRaw = String(
  process.env.AFFIRM_ENV || process.env.VITE_AFFIRM_ENV || ""
).toLowerCase();

const isProd = envRaw === "prod" || envRaw === "production";

const BASE = isProd
  ? "https://api.affirm.com/api/v2"
  : "https://api.sandbox.affirm.com/api/v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-diag-secret",
};

const CAPTURE_DEFAULT = true;

const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 4000);
  } catch {
    return "[unserializable]";
  }
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const PUB =
      process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY || "";
    const PRIV =
      process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || "";

    // ---------- DIAG LOCAL ----------
    if (body && body.diag === true) {
      const diag = {
        envRaw: envRaw || null,
        isProd,
        baseURL: BASE,
        nodeVersion: process.versions?.node,
        flags: {
          HAS_AFFIRM_PUBLIC_KEY: Boolean(PUB),
          HAS_AFFIRM_PRIVATE_KEY: Boolean(PRIV),
          HAS_VITE_AFFIRM_PUBLIC_KEY: Boolean(process.env.VITE_AFFIRM_PUBLIC_KEY),
          HAS_DIAG_SECRET: Boolean(process.env.DIAG_SECRET),
        },
      };
      return json(200, { ok: true, diag });
    }

    // ---------- DIAG REMOTO (NO requiere checkout real) ----------
    // Llama a /charges con token inválido. Si devuelve 400/422 => auth OK.
    if (body && body.diag === "remote") {
      const secret = process.env.DIAG_SECRET;
      if (secret) {
        const got = event.headers?.["x-diag-secret"] || event.headers?.["X-Diag-Secret"];
        if (String(got || "") !== String(secret)) {
          return json(403, { ok: false, error: "diag_forbidden" });
        }
      }

      if (!PUB || !PRIV) {
        return json(500, {
          ok: false,
          error: "Missing AFFIRM keys (AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY)",
        });
      }

      const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

      const testRes = await fetch(`${BASE}/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify({ checkout_token: "FAKE_TEST_TOKEN_DO_NOT_USE" }),
      });

      const testBody = await tryJson(testRes);

      return json(200, {
        ok: true,
        remote: {
          env: isProd ? "prod" : "sandbox",
          baseURL: BASE,
          status: testRes.status,
          // Si auth está mal, normalmente vas a ver 401.
          // Si auth está bien, vas a ver 400/422 por token inválido.
          body: testBody,
        },
      });
    }

    // ---------- FLUJO REAL ----------
    const {
      checkout_token,
      order_id,
      amount_cents,
      shipping_carrier,
      shipping_confirmation,
      capture,
    } = body || {};

    if (typeof checkout_token !== "string" || !checkout_token.trim()) {
      return json(400, { error: "Missing checkout_token" });
    }
    if (typeof order_id !== "string" || !order_id.trim()) {
      return json(400, { error: "Missing order_id" });
    }
    if (!PUB || !PRIV) {
      return json(500, {
        error: "Missing AFFIRM keys (AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY)",
      });
    }

    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Autorizar
    const authRes = await fetch(`${BASE}/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token }),
    });

    const charge = await tryJson(authRes);
    console.log("[affirm charges]", {
      env: isProd ? "prod" : "sandbox",
      status: authRes.status,
      resp: safe(charge),
    });

    if (!authRes.ok) {
      return json(authRes.status, { step: "charges", error: charge });
    }

    // 2) Capturar
    const shouldCapture =
      typeof capture === "boolean" ? capture : CAPTURE_DEFAULT;

    let captureResp = null;

    if (shouldCapture) {
      if (typeof amount_cents !== "number" || !Number.isFinite(amount_cents)) {
        return json(400, {
          error: "amount_cents required (number) for capture=true",
        });
      }
      const amt = Math.round(amount_cents);
      if (amt <= 0) {
        return json(400, { error: "amount_cents must be > 0" });
      }

      const capRes = await fetch(
        `${BASE}/charges/${encodeURIComponent(charge.id)}/capture`,
        {
          method: "POST",
          headers: { Authorization: AUTH, "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order_id.trim(),
            amount: amt,
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
        return json(capRes.status, { step: "capture", error: captureResp });
      }
    }

    return json(200, { ok: true, charge, capture: captureResp });
  } catch (e) {
    console.error("[affirm-authorize] error", e);
    return json(500, { error: "server_error" });
  }
}

async function tryJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}
