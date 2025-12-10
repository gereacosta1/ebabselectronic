// src/lib/affirm.ts

declare global {
  interface Window {
    _affirm_config?: {
      public_api_key: string;
      script: string;
      locale?: string;
      country_code?: string;
    };
    affirm?: any;
  }
}

/* ---------- Utils ---------- */
function cdnFor(env: "prod" | "sandbox") {
  return env === "prod"
    ? "https://cdn1.affirm.com/js/v2/affirm.js"
    : "https://cdn1-sandbox.affirm.com/js/v2/affirm.js";
}

function getEnv(): "prod" | "sandbox" {
  const raw = (import.meta as any)?.env?.VITE_AFFIRM_ENV ?? "prod";
  return String(raw).toLowerCase() === "sandbox" ? "sandbox" : "prod";
}

/**
 * Leemos la clave de entorno una sola vez.
 * Si NO existe, Affirm queda desactivado.
 */
const PUBLIC_KEY_ENV = (
  (import.meta as any)?.env?.VITE_AFFIRM_PUBLIC_KEY ?? ""
).trim();

/** Bandera global para saber si Affirm está habilitado */
export const AFFIRM_ENABLED = !!PUBLIC_KEY_ENV;

/* ---------- Loader ---------- */
let loadingPromise: Promise<void> | null = null;

/**
 * Carga el SDK de Affirm una sola vez y espera a `affirm.ui.ready`.
 * - Usa VITE_AFFIRM_ENV (prod/sandbox)
 * - Limpia scripts viejos de otro entorno
 *
 * Si NO hay public key, no lanza error: simplemente loguea y resuelve.
 */
export function loadAffirm(
  publicKey?: string,
  env?: "prod" | "sandbox"
): Promise<void> {
  const key = (publicKey || PUBLIC_KEY_ENV || "").trim(); // NO eliminar prefijos pk_*

  // MODO STRIPE ONLY: si no hay clave, no rompemos la app
  if (!key) {
    console.warn(
      "[Affirm] Falta VITE_AFFIRM_PUBLIC_KEY. Affirm desactivado (solo Stripe)."
    );
    return Promise.resolve();
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve) => {
    const selectedEnv = env ?? getEnv();
    const scriptUrl = cdnFor(selectedEnv);

    // Quitar scripts de otro entorno
    document
      .querySelectorAll<HTMLScriptElement>(
        'script[src*="affirm.com/js/v2/affirm.js"]'
      )
      .forEach((s) => {
        if (s.src !== scriptUrl) s.remove();
      });

    // Config global ANTES de cargar script
    window._affirm_config = {
      public_api_key: key,
      script: scriptUrl,
      locale: "en_US",
      country_code: "US",
    };

    const finish = () => {
      try {
        if (window.affirm?.ui?.ready) {
          window.affirm.ui.ready(() => resolve());
          return;
        }
      } catch {
        // ignore
      }
      // Fallback por si no expone ui.ready (igual resolvemos)
      setTimeout(() => resolve(), 500);
    };

    // Reusar script si ya es el correcto
    const existing = Array.from(
      document.querySelectorAll<HTMLScriptElement>(
        'script[src*="affirm.com/js/v2/affirm.js"]'
      )
    ).find((s) => s.src === scriptUrl);

    if (existing && window.affirm) {
      finish();
      return;
    }

    const s = document.createElement("script");
    s.id = "affirm-sdk";
    s.async = true;
    s.src = scriptUrl;
    s.onload = finish;
    s.onerror = () => {
      console.error("[Affirm] No se pudo cargar el SDK:", scriptUrl);
      resolve(); // no bloquear la app
    };
    document.head.appendChild(s);
  });

  return loadingPromise;
}
