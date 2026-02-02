// netlify/functions/affirm-diag.mjs
export async function handler() {
  const json = (statusCode, obj) => ({
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(obj, null, 2),
  });

  try {
    const has = (k) => Boolean(String(process.env[k] || "").trim());

    const baseRaw = String(
      process.env.AFFIRM_BASE_URL || "https://api.affirm.com/api/v2"
    )
      .trim()
      .replace(/\/+$/, "");

    // Normalizamos: si alguien setea https://api.affirm.com, lo arreglamos.
    const base = baseRaw.endsWith("/api/v2") ? baseRaw : `${baseRaw}/api/v2`;

    const env = {
      AFFIRM_PUBLIC_KEY: has("AFFIRM_PUBLIC_KEY") || has("AFFIRM_PUBLIC_API_KEY"),
      AFFIRM_PRIVATE_KEY: has("AFFIRM_PRIVATE_KEY") || has("AFFIRM_PRIVATE_API_KEY"),
      AFFIRM_BASE_URL: base,
    };

    const priv = String(
      process.env.AFFIRM_PRIVATE_KEY || process.env.AFFIRM_PRIVATE_API_KEY || ""
    ).trim();

    const checks = {
      basePing: { attempted: false, status: null, ok: false },
      authCheck: { attempted: false, status: null, ok: false, note: "" },
    };

    // 1) Check de conectividad al baseUrl
    checks.basePing.attempted = true;
    try {
      const r0 = await fetch(base, { method: "GET" });
      checks.basePing.status = r0.status;
      checks.basePing.ok = r0.ok;
    } catch (e) {
      checks.basePing.status = "fetch_failed";
      checks.basePing.ok = false;
    }

    // 2) Check con auth (si hay private key)
    if (priv) {
      checks.authCheck.attempted = true;

      // Basic auth: private_key como usuario, password vacío
      const auth = "Basic " + Buffer.from(`${priv}:`).toString("base64");

      try {
        const r = await fetch(`${base}/transactions`, {
          method: "GET",
          headers: { authorization: auth },
        });

        checks.authCheck.status = r.status;
        checks.authCheck.ok = r.ok;

        if (r.status === 401 || r.status === 403) {
          checks.authCheck.note = "Auth failed (keys/merchant/baseUrl mismatch)";
        } else if (r.status === 404) {
          checks.authCheck.note = "Reached Affirm, but endpoint not found (check API path/version)";
        } else {
          checks.authCheck.note = "Reached Affirm with auth";
        }
      } catch (e) {
        checks.authCheck.status = "fetch_failed";
        checks.authCheck.ok = false;
        checks.authCheck.note = "Fetch failed";
      }
    }

    return json(200, { ok: true, env, checks });
  } catch (e) {
    return json(500, { ok: false, error: String(e?.message || e) });
  }
}
