"use client";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type JwtPayload = { exp?: number }; // exp en segundos (Unix)

function readTokenFromCookie(): string | null {
  const raw = document.cookie || "";
  const found = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));
  if (!found) return null;
  return decodeURIComponent(found.split("=").slice(1).join("="));
}

function clearClientSession() {
  // borra cookies no-HttpOnly
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "u=; path=/; max-age=0; SameSite=Lax";
  // borra LS
  try {
    localStorage.removeItem("token");
  } catch {}
}

export function useAuthExpiry(bufferMs = 60_000) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // limpia cualquier timer previo
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const token = readTokenFromCookie();
    if (!token) return;

    // decodifica exp del JWT
    let expMs: number | null = null;
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (typeof exp === "number") expMs = exp * 1000; // a milisegundos
    } catch {
      // si el token no se puede decodificar, no seteamos timer
    }

    if (expMs && expMs > 0) {
      const msUntilLogout = Math.max(0, expMs - Date.now() - bufferMs);
      // si ya venció (o estamos dentro del buffer), salir ya
      if (msUntilLogout === 0) {
        clearClientSession();
        router.replace("/");
        return;
      }
      timerRef.current = window.setTimeout(() => {
        clearClientSession();
        router.replace("/");
      }, msUntilLogout);
    }

    // sincroniza logout entre pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) router.replace("/");
    };
    window.addEventListener("storage", onStorage);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("storage", onStorage);
    };
  }, [router, pathname, bufferMs]);
}
