export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/planner/:path*", "/sessions/:path*"],
};
