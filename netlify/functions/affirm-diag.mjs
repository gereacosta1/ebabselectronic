export async function handler(event) {
  const json = (statusCode, obj) => ({
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    },
    body: JSON.stringify(obj, null, 2)
  });

  try {
    const has = (k) => Boolean(String(process.env[k] || "").trim());
    const base =
      String(process.env.AFFIRM_BASE_URL || "https://api.affirm.com/api/v2")
        .trim()
        .replace(/\/+$/, "");

    const env = {
      AFFIRM_PUBLIC_KEY: has("AFFIRM_PUBLIC_KEY") || has("AFFIRM_PUBLIC_API_KEY"),
      AFFIRM_PRIVATE_KEY: has("AFFIRM_PRIVATE_KEY") || has("AFFIRM_PRIVATE_API_KEY"),
      AFFIRM_BASE_URL: base
    };

    // No expongas keys reales: solo booleanos.
    // Intento de request mínimo (si hay private key)
    let authCheck = { attempted: false };
    const priv =
      String(process.env.AFFIRM_PRIVATE_KEY || process.env.AFFIRM_PRIVATE_API_KEY || "").trim();

    if (priv) {
      authCheck.attempted = true;
      const r = await fetch(`${base}/transactions`, {
        method: "GET",
        headers: { authorization: "Basic " + Buffer.from(`${priv}:`).toString("base64") }
      });

      authCheck.status = r.status;
      authCheck.ok = r.ok;
      authCheck.note =
        r.status === 401 || r.status === 403
          ? "Auth failed (keys/merchant/baseUrl)"
          : "Auth reached Affirm";
    }

    return json(200, { ok: true, env, authCheck });
  } catch (e) {
    return json(500, { ok: false, error: String(e?.message || e) });
  }
}
