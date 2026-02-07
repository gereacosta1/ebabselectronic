// netlify/functions/affirm-authorize.mjs
// PROD only - Affirm API v2
//
// ENV requeridas en Netlify (prod):
// - AFFIRM_PRIVATE_KEY (o AFFIRM_PRIVATE_API_KEY)
//
// Opcional (solo si tu cuenta realmente usa par pub+priv):
// - AFFIRM_PUBLIC_KEY  (o AFFIRM_PUBLIC_API_KEY)
//
// Opcional:
// - AFFIRM_BASE_URL  (default: https://api.affirm.com/api/v2)
// - DIAG_SECRET      (si existe, exige header x-diag-secret para diag remoto)
// - ALLOWED_ORIGINS  (CSV allowlist para CORS)

function normalizeAffirmBase(raw) {
  const s = String(raw || "").trim().replace(/\/+$/, "");
  if (!s) return "https://api.affirm.com/api/v2";
  return s.endsWith("/api/v2") ? s : `${s}/api/v2`;
}

const BASE = normalizeAffirmBase(process.env.AFFIRM_BASE_URL);


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

/**
 * Normaliza diag:
 * - querystring: ?diag=true | ?diag=false | ?diag=remote
 * - body: {"diag": true} | {"diag":"remote"}
 */
function normalizeDiag(bodyDiag, qsDiag) {
  const v = bodyDiag != null ? bodyDiag : qsDiag;
  if (v == null) return undefined;

  if (typeof v === "boolean") return v;

  const s = String(v).trim().toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  if (s === "remote") return "remote";

  // si mandan algo raro, lo devolvemos tal cual
  return v;
}

/**
 * Construye Authorization para Affirm.
 * Preferimos PRIVATE-only: Basic base64("PRIVATE:")
 * Fallback (solo si existe PUB): Basic base64("PUB:PRIV")
 */
function buildAuthCandidates(pub, priv) {
  const candidates = [];

  const PUB = String(pub || "").trim();
  const PRIV = String(priv || "").trim();

  // 1) Recomendado v2: private key como usuario y password vacío
  if (PRIV) {
    candidates.push({
      name: "private_only",
      header: "Basic " + Buffer.from(`${PRIV}:`, "utf8").toString("base64"),
    });
  }

  // 2) Fallback por compatibilidad: par pub+priv (solo si ambos existen)
  if (PUB && PRIV) {
    candidates.push({
      name: "pair_pub_priv",
      header: "Basic " + Buffer.from(`${PUB}:${PRIV}`, "utf8").toString("base64"),
    });
  }

  return candidates;
}


/**
 * Hace fetch intentando distintas auth hasta que no sea 401/403.
 * Si todas fallan, devuelve la última respuesta.
 */
async function fetchWithAuth(url, init, authCandidates) {
  let last = null;

  for (const cand of authCandidates) {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: cand.header,
      },
    });

    last = { res, authName: cand.name };

    // 401/403 => auth falló, probamos la próxima
    if (res.status === 401 || res.status === 403) continue;

    // cualquier otro status: devolvemos ya (incluye 400/422 => auth OK, token inválido)
    return last;
  }

  return last; // puede ser null si no había candidates
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
    // Body seguro
    let body = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      body = {};
    }

    const qs = event.queryStringParameters || {};
    const diag = normalizeDiag(body?.diag, qs?.diag);

    const PUB = String(
      process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY || ""
    ).trim();

    const PRIV = String(
      process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || ""
    ).trim();

    const authCandidates = buildAuthCandidates(PUB, PRIV);

    // ---------- DIAG LOCAL ----------
    if (diag === true) {
      return json(
        200,
        {
          ok: true,
          diag: {
            isProd: true,
            baseURL: BASE,
            nodeVersion: process.versions?.node,
            flags: {
              HAS_AFFIRM_PRIVATE_KEY: Boolean(PRIV),
              HAS_AFFIRM_PUBLIC_KEY: Boolean(PUB),
              HAS_VITE_AFFIRM_PUBLIC_KEY: Boolean(process.env.VITE_AFFIRM_PUBLIC_KEY),
              HAS_DIAG_SECRET: Boolean(process.env.DIAG_SECRET),
              HAS_ALLOWED_ORIGINS: Boolean(process.env.ALLOWED_ORIGINS),
              HAS_AFFIRM_BASE_URL: Boolean(process.env.AFFIRM_BASE_URL),
            },
            authCandidates: authCandidates.map((a) => a.name),
          },
        },
        cors
      );
    }

    // ---------- DIAG REMOTO ----------
    if (diag === "remote") {
      const secret = process.env.DIAG_SECRET;
      if (secret) {
        const got = getHeader(event, "x-diag-secret");
        if (String(got || "") !== String(secret)) {
          return json(403, { ok: false, error: "diag_forbidden" }, cors);
        }
      }

      if (!PRIV) {
        return json(
          500,
          { ok: false, error: "Missing AFFIRM_PRIVATE_KEY (or AFFIRM_PRIVATE_API_KEY)" },
          cors
        );
      }

      if (!authCandidates.length) {
        return json(
          500,
          { ok: false, error: "No auth candidates built (check env vars)" },
          cors
        );
      }

      try {
        const attempt = await fetchWithAuth(
          `${BASE}/charges`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checkout_token: "FAKE_TEST_TOKEN_DO_NOT_USE" }),
          },
          authCandidates
        );

        if (!attempt?.res) {
          return json(500, { ok: false, error: "auth_fetch_not_attempted" }, cors);
        }

        const { res, authName } = attempt;
        const testBody = await tryJson(res);
        const status = res.status;

        // PASS = 400/422 (token inválido => auth OK)
        // FAIL = 401/403 (auth mal) / 5xx (upstream)
        const pass = status === 400 || status === 422;

        return json(
          200,
          {
            ok: true,
            remote: {
              env: "prod",
              baseURL: BASE,
              auth_used: authName,
              status,
              pass,
              body: testBody,
            },
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
    if (!PRIV) {
      return json(
        500,
        { ok: false, error: "Missing AFFIRM_PRIVATE_KEY (or AFFIRM_PRIVATE_API_KEY)" },
        cors
      );
    }
    if (!authCandidates.length) {
      return json(
        500,
        { ok: false, error: "No auth candidates built (check env vars)" },
        cors
      );
    }

    // 1) Crear charge desde checkout_token
    const authAttempt = await fetchWithAuth(
      `${BASE}/charges`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout_token: checkout_token.trim() }),
      },
      authCandidates
    );

    if (!authAttempt?.res) {
      return json(500, { ok: false, error: "auth_fetch_not_attempted" }, cors);
    }

    const authRes = authAttempt.res;
    const charge = await tryJson(authRes);

    console.log("[affirm charges]", {
      env: "prod",
      auth_used: authAttempt.authName,
      status: authRes.status,
      order_id: String(order_id).slice(0, 80),
      charge_id: charge?.id || null,
      charge_status: charge?.status || null,
    });

    if (!authRes.ok) {
      return json(
        authRes.status,
        { ok: false, step: "charges", auth_used: authAttempt.authName, error: charge },
        cors
      );
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

      const capAttempt = await fetchWithAuth(
        `${BASE}/charges/${encodeURIComponent(charge.id)}/capture`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: order_id.trim(),
            amount: amt,
            shipping_carrier,
            shipping_confirmation,
          }),
        },
        authCandidates
      );

      if (!capAttempt?.res) {
        return json(500, { ok: false, error: "capture_fetch_not_attempted" }, cors);
      }

      const capRes = capAttempt.res;
      captureResp = await tryJson(capRes);

      console.log("[affirm capture]", {
        env: "prod",
        auth_used: capAttempt.authName,
        status: capRes.status,
        order_id: String(order_id).slice(0, 80),
        charge_id: charge?.id || null,
        capture_status: captureResp?.status || captureResp?.type || null,
      });

      if (!capRes.ok) {
        return json(
          capRes.status,
          { ok: false, step: "capture", auth_used: capAttempt.authName, error: captureResp },
          cors
        );
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
        stack: stack ? stack.slice(0, 2000) : undefined,
      },
      cors
    );
  }
}
