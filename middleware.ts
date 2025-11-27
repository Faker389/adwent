// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
//   const uid = req.cookies.get("uid")?.value;
//   const pathname = req.nextUrl.pathname;

//   // PUBLIC / ALLOWED paths — middleware will skip these
//   const publicPaths = [
//     "/auth",          // login / register page
//   ];

//   // If path starts with any public path, allow
//   if (publicPaths.some(p => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   // Protected routes you want to protect
//   const protectedRoutes = ["/", "/leaderboard", "/leaderboard/admin"];

//   // Check if current pathname is one of protected routes (exact or prefix)
//   const isProtected = protectedRoutes.some((r) =>
//     r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(r + "/") || pathname.startsWith(r)
//   );

//   if (isProtected && !uid) {
//     const loginUrl = new URL("/auth", req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
}
