export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/app", "/onboarding", "/routes", "/settings"],
};
