"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id?: string;
  name?: string;
  email?: string;
  rol?: "administrador" | "manager" | "visitante"; // ajusta si hay más
  status?: "active" | "inactive";
}

interface Session {
  user: User;
  token: string;
}

interface Ctx {
  // ctx => context
  user: User | null;
  token: string | null;
  /** guarda sesión después de login */
  setSession: (s: Session) => void;
  /** borra sesión (logout) */
  clearSession: () => void;
}

/* ------------------------ contexto ------------------------ */
const UserContext = createContext<Ctx | null>(null);

/* ------------------------ provider ------------------------ */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("u="))
      ?.slice(2);
    if (!raw) return;
    try {
      const u = JSON.parse(decodeURIComponent(raw));
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        rol: u.rol,
        status: u.status,
      });
    } catch {
      /* cookie corrupta: ignora */
    }
  }, []);

  const setSession = (s: Session) => {
    setUser(s.user);
    setToken(s.token);
    localStorage.setItem("authData", JSON.stringify(s));
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authData");
  };

  return (
    <UserContext.Provider value={{ user, token, setSession, clearSession }}>
      {children}
    </UserContext.Provider>
  );
}

/* ------------------------ hook ------------------------ */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
