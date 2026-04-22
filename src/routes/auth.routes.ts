import { AuthController } from "@/controllers/auth/auth.controller.js";
import { OAuthController } from "@/controllers/auth/oauth.controller";
import { protectedRouteMiddleware } from "@/middleware/authentication.middleware";
import { Router } from "express";

const authRoutes: Router = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post(
  "/refresh-token",
  protectedRouteMiddleware,
  AuthController.refreshToken,
);
authRoutes.post("/verify-email", AuthController.verifyEmail);
authRoutes.post(
  "/resend-verification-email",
  AuthController.resendVerificationEmail,
);
authRoutes.post("/forget-password", AuthController.forgetPassword);
authRoutes.post("/reset-password", AuthController.resetPassword);
authRoutes.post("/logout", AuthController.logout);
authRoutes.delete(
  "/delete-account",
  protectedRouteMiddleware,
  AuthController.deleteAccount,
);

// OAuth routes
authRoutes.post("/oauth/google", OAuthController.googleOAuth);
authRoutes.get("/oauth/github/callback", OAuthController.githubCallback);
authRoutes.get("/oauth/github/redirect", OAuthController.githubRedirect);

export default authRoutes;
