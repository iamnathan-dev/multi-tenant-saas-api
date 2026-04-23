import { Route } from "@/constant/constant";
import { METHOD } from "@/constant/methods.constant";
import { rateLimits } from "@/constant/rateLimits.constant";
import { AuthController } from "@/controllers/auth/auth.controller.js";
import { OAuthController } from "@/controllers/auth/oauth.controller";
import { protectedRoute } from "@/util/protected";
import { withRateLimit } from "@/util/withRateLimit";
import { Router } from "express";

const authRoutes: Router = Router();

const routes: Route[] = [
  {
    method: METHOD.POST,
    path: "/login",
    handlers: withRateLimit(rateLimits.STRICT, AuthController.login),
  },
  {
    method: METHOD.POST,
    path: "/register",
    handlers: withRateLimit(rateLimits.STRICT, AuthController.register),
  },
  {
    method: METHOD.POST,
    path: "/refresh-token",
    handlers: withRateLimit(rateLimits.RELAXED, AuthController.refreshToken),
  },
  {
    method: METHOD.POST,
    path: "/verify-email",
    handlers: withRateLimit(rateLimits.STRICT, AuthController.verifyEmail),
  },
  {
    method: METHOD.POST,
    path: "/resend-verification-email",
    handlers: withRateLimit(
      rateLimits.VERY_STRICT,
      AuthController.resendVerificationEmail,
    ),
  },
  {
    method: METHOD.POST,
    path: "/forget-password",
    handlers: withRateLimit(rateLimits.PASSWORD, AuthController.forgetPassword),
  },
  {
    method: METHOD.POST,
    path: "/reset-password",
    handlers: withRateLimit(rateLimits.STRICT, AuthController.resetPassword),
  },
  {
    method: METHOD.POST,
    path: "/logout",
    handlers: withRateLimit(rateLimits.LOOSE, AuthController.logout),
  },
  {
    method: METHOD.DELETE,
    path: "/delete-account",
    handlers: protectedRoute(
      ...withRateLimit(
        { capacity: 5, refillRate: 0.2 },
        AuthController.deleteAccount,
      ),
    ),
  },

  // OAuth
  {
    method: METHOD.POST,
    path: "/oauth/google",
    handlers: withRateLimit(rateLimits.OAUTH, OAuthController.googleOAuth),
  },
  {
    method: METHOD.GET,
    path: "/oauth/github/callback",
    handlers: withRateLimit(rateLimits.OAUTH, OAuthController.githubCallback),
  },
  {
    method: METHOD.GET,
    path: "/oauth/github/redirect",
    handlers: withRateLimit(rateLimits.OAUTH, OAuthController.githubRedirect),
  },
];

routes.forEach(({ method, path, handlers }) => {
  authRoutes[method](path, ...handlers);
});

export default authRoutes;
