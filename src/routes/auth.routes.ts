import { Route } from "@/constant/constant";
import { AuthController } from "@/controllers/auth/auth.controller.js";
import { OAuthController } from "@/controllers/auth/oauth.controller";
import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";
import { rateLimitter } from "@/middleware/rate-limitter.middleware";
import { Router } from "express";

const authRoutes: Router = Router();

const routes: Route[] = [
  // Auth routes
  {
    method: "post",
    path: "/login",
    handlers: [
      rateLimitter({ capacity: 5, refillRate: 0.1 }),
      AuthController.login,
    ],
  },
  {
    method: "post",
    path: "/register",
    handlers: [
      rateLimitter({ capacity: 10, refillRate: 0.2 }),
      AuthController.register,
    ],
  },
  {
    method: "post",
    path: "/refresh-token",
    handlers: [AuthController.refreshToken],
  },
  {
    method: "post",
    path: "/verify-email",
    handlers: [AuthController.verifyEmail],
  },
  {
    method: "post",
    path: "/resend-verification-email",
    handlers: [AuthController.resendVerificationEmail],
  },
  {
    method: "post",
    path: "/forget-password",
    handlers: [
      rateLimitter({ capacity: 3, refillRate: 0.05 }),
      AuthController.forgetPassword,
    ],
  },
  {
    method: "post",
    path: "/reset-password",
    handlers: [AuthController.resetPassword],
  },
  { method: "post", path: "/logout", handlers: [AuthController.logout] },
  {
    method: "delete",
    path: "/delete-account",
    handlers: [protectedRouteMiddleware, AuthController.deleteAccount],
  },

  // OAuth routes
  {
    method: "post",
    path: "/oauth/google",
    handlers: [OAuthController.googleOAuth],
  },
  {
    method: "get",
    path: "/oauth/github/callback",
    handlers: [OAuthController.githubCallback],
  },
  {
    method: "get",
    path: "/oauth/github/redirect",
    handlers: [OAuthController.githubRedirect],
  },
];

routes.forEach(({ method, path, handlers }) => {
  authRoutes[method](path, ...handlers);
});

export default authRoutes;
