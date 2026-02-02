// netlify/functions/affirm-authorize.mjs
// PROD only - Affirm API v2
//
// ENV requeridas en Netlify:
// - AFFIRM_PUBLIC_KEY  (o AFFIRM_PUBLIC_API_KEY)
// - AFFIRM_PRIVATE_KEY (o AFFIRM_PRIVATE_API_KEY)
//
// Opcional:
// - AFFIRM_BASE_URL  (default: https://api.affirm.com/api/v2)  <-- si querés forzar
// - DIAG_SECRET      (si existe, exige header x-diag-secret para diag remoto)
// - ALLOWED_ORIGINS  (CSV allowlist para CORS)

const BASE =
  String(process.env.AFFIRM_BASE_URL || "https://api.affirm.com/api/v2")
    .trim()
    .replace(/\/+$/, ""); // sin trailing slash

const CAPTURE_DEFAULT = true;

// -------- CORS (opcional por allowlist) --------
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function getOrigin(event) {
  const h = event?.headers || {};
  return h.origin || h.Origin || "";
}

function corsHeadersFor(event) {
  const origin = getOrigin(event);

  if (allowedOrigins.length) {
    const ok = allowedOrigins.includes(origin);
    return {
      "Access-Control-Allow-Origin": ok ? origin : allowedOrigins[0],
      Vary: "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-diag-secret",
      "Cache-Control": "no-store",
    };
  }

  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-diag-secret",
    "Cache-Control": "no-store",
  };
}

// Logging seguro (recorta). Evitá loguear PII.
const safe = (o) => {
  try {
    return JSON.stringify(o, null, 2).slice(0, 2500);
  } catch {
    return "[unserializable]";
  }
};

const getHeader = (event, name) => {
  const h = event?.headers || {};
  const keyLower = String(name).toLowerCase();
  return (
    h[keyLower] ??
    h[name] ??
    h[name.toLowerCase()] ??
    h[name.toUpperCase()] ??
    ""
  );
};

function json(statusCode, obj, cors) {
  return {
    statusCode,
    headers: { ...cors, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

async function tryJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function handler(event) {
  const cors = corsHeadersFor(event);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };
  }

  try {
    let body = {};
try {
  body = event.body ? JSON.parse(event.body) : {};
} catch (e) {
  // fallback: permitir diag por querystring para debug
  body = {};
}
const qs = event.queryStringParameters || {};
if (!body.diag && qs.diag) body.diag = qs.diag;


    const PUB =
      process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY || "";
    const PRIV =
      process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || "";

    // ---------- DIAG LOCAL ----------
    if (body && body.diag === true) {
      return json(
        200,
        {
          ok: true,
          diag: {
            isProd: true,
            baseURL: BASE,
            nodeVersion: process.versions?.node,
            flags: {
              HAS_AFFIRM_PUBLIC_KEY: Boolean(PUB),
              HAS_AFFIRM_PRIVATE_KEY: Boolean(PRIV),
              HAS_VITE_AFFIRM_PUBLIC_KEY: Boolean(process.env.VITE_AFFIRM_PUBLIC_KEY),
              HAS_DIAG_SECRET: Boolean(process.env.DIAG_SECRET),
              HAS_ALLOWED_ORIGINS: Boolean(process.env.ALLOWED_ORIGINS),
              HAS_AFFIRM_BASE_URL: Boolean(process.env.AFFIRM_BASE_URL),
            },
          },
        },
        cors
      );
    }

    
       // ---------- DIAG REMOTO ----------
    if (body && body.diag === "remote") {
      const secret = process.env.DIAG_SECRET;
      if (secret) {
        const got = getHeader(event, "x-diag-secret");
        if (String(got || "") !== String(secret)) {
          return json(403, { ok: false, error: "diag_forbidden" }, cors);
        }
      }

      if (!PUB || !PRIV) {
        return json(
          500,
          { ok: false, error: "Missing AFFIRM keys (AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY)" },
          cors
        );
      }

      const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

      try {
        const testRes = await fetch(`${BASE}/charges`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: AUTH },
          body: JSON.stringify({ checkout_token: "FAKE_TEST_TOKEN_DO_NOT_USE" }),
        });

        const testBody = await tryJson(testRes);
        const status = testRes.status;

        // PASS = 400/422 (token inválido => auth OK)
        // FAIL = 401/403 (auth mal) / 5xx (upstream)
        const pass = status === 400 || status === 422;

        return json(
          200,
          {
            ok: true,
            remote: { env: "prod", baseURL: BASE, status, pass, body: testBody },
          },
          cors
        );
      } catch (e) {
        const msg = String(e?.message || e);
        return json(
          200,
          {
            ok: true,
            remote: {
              env: "prod",
              baseURL: BASE,
              status: "fetch_failed",
              pass: false,
              error: msg,
            },
          },
          cors
        );
      }
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
      return json(400, { ok: false, error: "Missing checkout_token" }, cors);
    }
    if (typeof order_id !== "string" || !order_id.trim()) {
      return json(400, { ok: false, error: "Missing order_id" }, cors);
    }
    if (!PUB || !PRIV) {
      return json(
        500,
        {
          ok: false,
          error: "Missing AFFIRM keys (AFFIRM_PUBLIC_KEY / AFFIRM_PRIVATE_KEY)",
        },
        cors
      );
    }

    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Crear charge desde checkout_token
    const authRes = await fetch(`${BASE}/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token }),
    });

    const charge = await tryJson(authRes);

    console.log("[affirm charges]", {
      env: "prod",
      status: authRes.status,
      order_id: String(order_id).slice(0, 80),
      charge_id: charge?.id || null,
      charge_status: charge?.status || null,
    });

    if (!authRes.ok) {
      return json(authRes.status, { ok: false, step: "charges", error: charge }, cors);
    }

    // 2) Capturar (si corresponde)
    const shouldCapture = typeof capture === "boolean" ? capture : CAPTURE_DEFAULT;
    let captureResp = null;

    if (shouldCapture) {
      if (typeof amount_cents !== "number" || !Number.isFinite(amount_cents)) {
        return json(
          400,
          { ok: false, error: "amount_cents required (number) for capture=true" },
          cors
        );
      }

      const amt = Math.round(amount_cents);
      if (amt <= 0) {
        return json(400, { ok: false, error: "amount_cents must be > 0" }, cors);
      }

      const capRes = await fetch(`${BASE}/charges/${encodeURIComponent(charge.id)}/capture`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order_id.trim(),
          amount: amt,
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      captureResp = await tryJson(capRes);

      console.log("[affirm capture]", {
        status: capRes.status,
        order_id: String(order_id).slice(0, 80),
        charge_id: charge?.id || null,
        capture_status: captureResp?.status || captureResp?.type || null,
      });

      if (!capRes.ok) {
        return json(capRes.status, { ok: false, step: "capture", error: captureResp }, cors);
      }
    }

    return json(200, { ok: true, charge, capture: captureResp }, cors);
  } catch (e) {
    const msg = String(e?.message || e);
    const stack = String(e?.stack || "");
    console.error("[affirm-authorize] error", msg, stack);

    return json(
      500,
      {
        ok: false,
        error: "server_error",
        message: msg,
        // stack recortado para que no sea eterno
        stack: stack ? stack.slice(0, 2000) : undefined,
      },
      cors
    );
  }
}
