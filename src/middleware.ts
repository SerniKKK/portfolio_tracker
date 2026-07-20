import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = Boolean(req.auth);
  const path = req.nextUrl.pathname;

  const isPublic = path === "/signin" || path.startsWith("/api/auth");
  if (isPublic) return NextResponse.next();

  if (!isAuth) {
    const url = new URL("/signin", req.nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
