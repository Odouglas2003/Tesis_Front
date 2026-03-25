import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
  ],
};

const PROTECTED_PREFIXES = [
  "/pages/dash",
  "/pages/admin",
  "/pages/projects",
  "/pages/collaborators",
  "/pages/vacantes",
  "/pages/tecnology",
  "/pages/configuration",
];

function isExpired(token: string | null, leewayMs = 60_000): boolean {
  if (!token) return true;
  try {
    const { exp } = decodeJwt(token) as { exp?: number };
    if (!exp) return false;
    return exp * 1000 <= Date.now() + leewayMs; 
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value ?? null;
  const { pathname } = req.nextUrl;

  if (token && isExpired(token)) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    res.cookies.set("u", "", { path: "/", maxAge: 0 });
    return res;
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/pages/dash", req.url));
  }

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
