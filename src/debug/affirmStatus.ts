// src/debug/affirmStatus.ts
// Debug helper para validar:
// 1) tu Function de Netlify responde y tiene env/keys
// 2) (opcional) la Function puede pegarle a Affirm (remote diag)
//
// Uso en DevTools Console:
//   __EBABS__.logAffirmStatus()
//   __EBABS__.logAffirmStatus({ remote: true })

type FnLocalDiag = {
  isProd: boolean;
  baseURL: string;
  nodeVersion?: string;
  flags?: Record<string, boolean>;
};

type RemoteDiag = {
  env: string; // "prod"
  baseURL: string;
  status: number; // status devuelto por Affirm
  pass: boolean;  // true si status 400/422 (token fake => auth OK)
  body: any;
};

type FnDiagOut = {
  ok: boolean;
  diag?: FnLocalDiag;
  remote?: RemoteDiag;
  error?: any;
};

type SDKDiag = {
  loaded: boolean;
  env: string; // "unknown" en tu caso si no lo seteás
  key_starts_with: string;
};

type FnStatus = {
  ok: boolean;
  isProd: boolean;
  baseURL: string;
  remote?: RemoteDiag; // ✅ esto evita el error de TS en fn.remote = remote
};

export type AffirmStatusOut = {
  page: string;
  fn: FnStatus;
  sdk: SDKDiag;
  ok: boolean;
};

async function postJSON<T = any>(url: string, body: any): Promise<{ ok: boolean; status: number; body: T }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  const text = await res.text();
  let parsed: any = null;

  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text }; // por si vuelve HTML o texto
  }

  return { ok: res.ok, status: res.status, body: parsed as T };
}

function getSdkDiag(): SDKDiag {
  // Intento detectar el objeto de Affirm del lado del browser (si está cargado)
  const w = window as any;

  const maybeAffirm =
    w?.affirm ||
    w?.Affirm ||
    w?.AffirmCheckout ||
    w?.AffirmSDK ||
    null;

  // Tu public key normalmente arranca con algo tipo "X3..."
  const viteKey =
    (import.meta as any)?.env?.VITE_AFFIRM_PUBLIC_KEY ||
    (import.meta as any)?.env?.VITE_AFFIRM_PUBLIC_API_KEY ||
    "";

  const key_starts_with = String(viteKey || "").slice(0, 6);

  return {
    loaded: Boolean(maybeAffirm),
    env: "unknown",
    key_starts_with,
  };
}

export async function logAffirmStatus(opts?: { remote?: boolean }): Promise<AffirmStatusOut> {
  const page = window.location.origin;

  // 1) Local diag (NO pega a Affirm; sólo confirma env/config/keys en tu Function)
  const fnLocal = await postJSON<{ ok: boolean; diag?: FnLocalDiag; error?: any }>(
    "/.netlify/functions/affirm-authorize",
    { diag: true }
  );

  const diag: FnLocalDiag | null = fnLocal.body?.diag ?? null;

  const fn: FnStatus = {
    ok: Boolean(fnLocal.body?.ok),
    isProd: Boolean(diag?.isProd),
    baseURL: String(diag?.baseURL || ""),
    remote: undefined, // ✅ permite asignar después sin error
  };

  // 2) Remote diag (opcional): pega a Affirm con token fake
  if (opts?.remote) {
    const fnRemote = await postJSON<FnDiagOut>(
      "/.netlify/functions/affirm-authorize",
      { diag: "remote" }
    );

    const remote: RemoteDiag | undefined = fnRemote.body?.remote;
    fn.remote = remote; // ✅ ya no rompe TS

    // Si remote existe, interpretamos resultados
    if (remote) {
      if (remote.status === 401 || remote.status === 403) {
        console.warn(
          "[Affirm STATUS] Remote check returned 401/403 (Unauthorized). " +
            "Eso indica keys inválidas o pareja PUB:PRIV incorrecta en Netlify."
        );
      } else if (!(remote.status === 400 || remote.status === 422)) {
        console.warn(
          "[Affirm STATUS] Remote check no devolvió 400/422. " +
            "Lo esperado con token fake y auth OK es 400/422. " +
            "Si ves 200 con HTML/raw, revisá que BASE sea https://api.affirm.com/api/v2 " +
            "y que tu Function esté devolviendo JSON (no una página).",
          remote
        );
      }
    }
  }

  const sdk = getSdkDiag();

  const out: AffirmStatusOut = {
    page,
    fn,
    sdk,
    ok:
      fn.ok === true &&
      fn.isProd === true &&
      Boolean(fn.baseURL) &&
      sdk.loaded === true,
  };

  console.log(
    "%c[Affirm STATUS]",
    "padding:2px 6px;border-radius:6px;color:#fff;background:#6d28d9",
    out
  );

  return out;
}

/**
 * ✅ Auto-attach en window para usar desde Console SIN importar nada
 * Uso:
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
  const w = window as Window;
  // ✅ inicializa el objeto si no existe, así no queda “possibly undefined”
  w.__EBABS__ = w.__EBABS__ ?? { logAffirmStatus };
  w.__EBABS__.logAffirmStatus = logAffirmStatus;
}
