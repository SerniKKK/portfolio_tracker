import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe subset of the auth config. No Prisma adapter, no DB access here.
// Used by the middleware which runs on the edge runtime.
export const authConfig = {
  providers: [Google],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isAuth = Boolean(auth?.user);
      const path = request.nextUrl.pathname;
      const isPublic =
        path === "/signin" ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/cron");
      if (isPublic) return true;
      return isAuth;
    },
  },
} satisfies NextAuthConfig;
