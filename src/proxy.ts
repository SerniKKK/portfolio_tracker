import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Skip Next internals and public static assets (favicon, PWA manifest, app
  // icons). These must stay reachable without auth so the manifest and icons
  // load for signed-out visitors and for PWA install.
  matcher: [
    "/((?!_next/static|_next/image|sw.js|.*\\.(?:png|ico|svg|webmanifest)$).*)",
  ],
};
