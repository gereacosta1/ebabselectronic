// src/debug/affirmStatus.ts
// Helper de debug para ver estado de Affirm (front + backend diag)

export type AffirmStatusOut = {
  page: string;
  sdk: {
    env: "sandbox" | "production" | "unknown";
    key_starts_with: string;
    loaded: boolean;
  };
  fn: {
    ok: boolean;
    baseURL: string | null;
    isProd: boolean | null;
    remote?: {
      status: number;
      pass: boolean;
      body?: any;
    };
  };
  ok: boolean;
};

export async function logAffirmStatus(opts?: { remote?: boolean }): Promise<AffirmStatusOut> {
  const page = location.origin;

  const sdk = (window as any).affirm;
  const cfg = (window as any).__affirm_config || {};
  const env = (import.meta as any).env || {};
  const hasVitePk = Boolean(env.VITE_AFFIRM_PUBLIC_KEY);

  // ---- backend diag (no expone claves) ----
  let fn: AffirmStatusOut["fn"] = { ok: false, baseURL: null, isProd: null };

  // diag local (solo lee env/flags)
  try {
    const r = await fetch("/.netlify/functions/affirm-authorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diag: true }),
    });
    const j = await r.json().catch(() => null);

    if (j?.ok && j?.diag) {
      fn.ok = true;
      fn.baseURL = j.diag.baseURL ?? null;
      fn.isProd = j.diag.isProd ?? null;
    }
  } catch {
    // ignore
  }

  // diag remoto (hace request real a Affirm con token inválido)
  if (opts?.remote) {
    try {
      const r = await fetch("/.netlify/functions/affirm-authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diag: "remote" }),
      });
      const j = await r.json().catch(() => null);
      if (j?.ok && j?.remote) {
        fn.remote = {
          status: Number(j.remote.status),
          pass: Boolean(j.remote.pass),
          body: j.remote.body,
        };
      }
    } catch {
      // ignore
    }
  }

  const out: AffirmStatusOut = {
    page,
    sdk: {
      env: String(cfg?.script || "").includes("sandbox")
        ? "sandbox"
        : String(cfg?.script || "").includes("affirm.com")
        ? "production"
        : "unknown",
      key_starts_with: String(cfg?.public_api_key || "").slice(0, 6),
      loaded: Boolean(sdk && (sdk.ui || sdk.checkout)),
    },
    fn,
    ok:
      fn.ok === true &&
      fn.isProd === true &&
      hasVitePk === true &&
      !cfg?.public_api_key && // ideal: no meter pk en window config si ya usás VITE_
      Boolean(sdk && (sdk.ui || sdk.checkout)),
  };

  console.log(
    "%c[Affirm STATUS]",
    "padding:2px 6px;border-radius:6px;color:#fff;background:#6d28d9",
    out
  );

  // Si pediste remote diag y da 401, hacelo bien explícito:
  if (opts?.remote && out.fn.remote?.status === 401) {
    console.warn(
      "[Affirm STATUS] Remote check returned 401 (Unauthorized). " +
        "Esto indica que el backend está llamando a Affirm sin credenciales válidas " +
        "(keys inválidas o pareja PUB:PRIV incorrecta)."
    );
  }

  return out;
}

/**
 * ✅ Auto-attach en window para usarlo desde Console sin pegar imports/exports:
 *   __EBABS__.logAffirmStatus()
 *   __EBABS__.logAffirmStatus({ remote: true })
 */
declare global {
  interface Window {
    __EBABS__?: {
      logAffirmStatus: (opts?: { remote?: boolean }) => Promise<AffirmStatusOut>;
    };
  }
}

if (typeof window !== "undefined") {
  // TS no “narrowea” __EBABS__ aunque lo inicialices, por eso usamos ! luego
  window.__EBABS__ = window.__EBABS__ || ({} as any);
  window.__EBABS__!.logAffirmStatus = logAffirmStatus;
}
