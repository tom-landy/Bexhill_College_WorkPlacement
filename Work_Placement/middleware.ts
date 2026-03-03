export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/students/:path*",
    "/passport/:path*",
    "/student/:path*",
    "/careers/:path*",
    "/employers/:path*",
    "/opportunities/:path*",
    "/placements/:path*",
    "/staff/:path*",
    "/employer/:path*",
    "/exports/:path*",
    "/api/exports/:path*",
    "/api/employer/:path*",
    "/api/students/:path*",
    "/api/invites/consume/:path*"
  ]
};
