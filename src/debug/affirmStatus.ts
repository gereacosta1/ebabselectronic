// src/debug/affirmStatus.ts
// Helper de debug para verificar:
// 1) si el SDK de Affirm está cargado en el front
// 2) si el backend (Netlify Function) está levantado y en qué env/baseURL
// 3) opcional: "remote diag" que prueba auth contra Affirm con token falso

export type AffirmStatusOut = {
  page: string;
  sdk: {
    env: string;
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
      body: any;
      baseURL?: string;
      env?: string;
    };
  };
  ok: boolean;
};

export async function logAffirmStatus(opts?: { remote?: boolean }) {
  const page = typeof window !== "undefined" ? window.location.origin : "ssr";

  const sdk = (window as any).affirm;
  const cfg = (window as any)._affirm_config || {};
  const env = (import.meta as any).env || {};

  const vitePk = String(env.VITE_AFFIRM_PUBLIC_KEY || "");
  const hasVitePk = Boolean(vitePk);

  // --- backend diag (claves NO reveladas) ---
  let fn: AffirmStatusOut["fn"] = { ok: false, baseURL: null, isProd: null };

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
    // no-op
  }

  // --- remote diag (opcional) ---
  if (opts?.remote) {
    try {
      const r = await fetch("/.netlify/functions/affirm-authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diag: "remote" }),
      });

      const j = await r.json().catch(() => null);

      if (j?.ok && j?.remote) {
        fn.remote = j.remote;
      } else {
        fn.remote = {
          status: r.status,
          pass: false,
          body: j ?? { error: "remote_diag_invalid_response" },
        };
      }
    } catch (e: any) {
      fn.remote = {
        status: 0,
        pass: false,
        body: { error: "remote_diag_fetch_failed", message: String(e?.message || e) },
      };
    }
  }

  const out: AffirmStatusOut = {
    page,
    sdk: {
      env: typeof cfg?.script === "string" && cfg.script.includes("sandbox") ? "sandbox" : "unknown",
      key_starts_with: String(cfg?.public_api_key || vitePk || "").slice(0, 6),
      loaded: Boolean(sdk && (sdk.ui || sdk.checkout)),
    },
    fn,
    ok:
      fn.ok === true &&
      fn.isProd === true &&
      hasVitePk === true &&
      // tu check original: que no estés seteando public_api_key en window config
      // (si lo querés permitir, borrá esta condición)
      !cfg?.public_api_key &&
      Boolean(sdk && (sdk.ui || sdk.checkout)),
  };

  console.log(
    "%c[Affirm STATUS]",
    "padding:2px 6px;border-radius:6px;color:#fff;background:#6d28d9",
    out
  );

  // Si pediste remote y no pasa, dejalo MUY visible:
  if (opts?.remote && out.fn.remote) {
    const st = out.fn.remote.status;
    if (st === 401 || st === 403) {
      console.warn(
        "[Affirm STATUS] Remote check devolvió 401/403 (Unauthorized). " +
          "Eso casi siempre significa PUB/PRIV inválidas o pareja incorrecta (prod vs sandbox)."
      );
    } else if (st && st !== 400 && st !== 422) {
      console.warn(
        "[Affirm STATUS] Remote check no devolvió 400/422. " +
          "Esperado si auth OK y token fake. Revisá baseURL o respuesta (a veces viene HTML si el endpoint/base está mal)."
      );
    }
  }

  return out;
}

// ---- Auto-attach a window para usarlo desde DevTools Console ----
// Uso:
// __EBABS__.logAffirmStatus()
// __EBABS__.logAffirmStatus({ remote: true })

declare global {
  interface Window {
    __EBABS__?: {
      logAffirmStatus: (opts?: { remote?: boolean }) => Promise<AffirmStatusOut>;
    };
  }
}

if (typeof window !== "undefined") {
  const w = window as Window;

  // ✅ Esto elimina el "possibly undefined" para TS
  if (!w.__EBABS__) w.__EBABS__ = { logAffirmStatus };

  // si ya existía, solo pisamos/aseguramos la función
  w.__EBABS__.logAffirmStatus = logAffirmStatus;
}
