import type { ReactNode } from "react";
import AuthExpiryWatcher from "@/components/auth/AuthExpiryWatcher";

export default function ProtectedPagesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AuthExpiryWatcher />
      {children}
    </>
  );
}
