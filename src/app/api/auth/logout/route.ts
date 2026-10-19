import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/", req.url));

  response.cookies.set("token", "", { path: "/", maxAge: 0 });
  response.cookies.set("u", "", { path: "/", maxAge: 0 });

  return response;
}
