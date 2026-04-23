import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";

export const protectedRoute = (...handlers: any[]) => {
  return [protectedRouteMiddleware, ...handlers];
};
