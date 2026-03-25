// lib/http.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const COOKIE_NAME = "token";
const LS_KEY = "token";

// Endpoints públicos (no enviar Authorization y no auto-logout si devuelven 401)
const PUBLIC_ENDPOINTS = [
  "/api/user/login",
  "/api/user/register",
  "/api/user/auth/resetpassword",
];

// ----------------------------------------
// Utils
// ----------------------------------------
function buildFullUrl(
  cfg: { baseURL?: string; url?: string } | undefined
): string {
  if (!cfg) return "";
  const url = (cfg.url ?? "").toString();
  if (/^https?:\/\//i.test(url)) return url;
  const base = (cfg.baseURL ?? "").toString();
  if (!base) return url;
  return `${base.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

function isPublicEndpoint(
  cfg: { baseURL?: string; url?: string } | undefined
): boolean {
  const full = buildFullUrl(cfg);
  // Chequeamos por substring del path; robusto aunque baseURL repita /api
  return PUBLIC_ENDPOINTS.some((p) => full.includes(p));
}

function clearClientSession() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "u=; path=/; max-age=0; SameSite=Lax";
}

function getCookieFromDocument(name: string): string | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie || "";
  const found = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.toLowerCase().startsWith(`${name.toLowerCase()}=`));
  if (!found) return null;
  return decodeURIComponent(found.split("=").slice(1).join("="));
}

function getTokenFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

async function getTokenUniversal(): Promise<{ token: string | null }> {
  // CLIENTE
  if (typeof window !== "undefined") {
    const fromCookie = getCookieFromDocument(COOKIE_NAME);
    if (fromCookie) return { token: fromCookie };
    const fromLS = getTokenFromLocalStorage();
    if (fromLS) return { token: fromLS };
    return { token: null };
  }
  // SERVER
  try {
    const { cookies } = await import("next/headers");
    const t = (await cookies()).get(COOKIE_NAME)?.value ?? null;
    return { token: t };
  } catch {
    return { token: null };
  }
}

// ----------------------------------------
// Axios instance
// ----------------------------------------
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 400000,
  withCredentials: false, // usamos Authorization; no mandamos cookies al backend
});

// ----------------------------------------
// Interceptors
// ----------------------------------------
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // NO adjunta Authorization en endpoints login/register/resetpassword
  if (!isPublicEndpoint(config)) {
    const { token } = await getTokenUniversal();
    if (token) {
      config.headers = config.headers ?? {};
      (
        config.headers as Record<string, string>
      ).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const isPublic = isPublicEndpoint(error.config);

    // Si devuelve 401 y NO es un endpoint público => limpiar y redirigir al login
    if (status === 401 && !isPublic) {
      if (typeof window !== "undefined") {
        clearClientSession();
        window.location.replace("/");
        return Promise.reject(error);
      }
      try {
        const { redirect } = await import("next/navigation");
        redirect("/");
      } catch {
        /* no-op: si no estamos en un Server Component */
      }
    }
    return Promise.reject(error);
  }
);

export default api;
