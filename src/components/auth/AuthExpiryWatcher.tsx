"use client";
import { useAuthExpiry } from "./useAuthExpiry";

export default function AuthExpiryWatcher() {
  // 1 min antes del vencimiento
  useAuthExpiry(60_000);
  return null;
}
