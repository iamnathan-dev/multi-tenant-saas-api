import { AuthController } from "@/controllers/auth/auth.controller.js";
import { OAuthController } from "@/controllers/auth/oauth.controller";
import { Router } from "express";

const authRoutes: Router = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post("/refresh-token", AuthController.refreshToken);
authRoutes.post("/verify-email", AuthController.verifyEmail);
authRoutes.post("/forget-password", AuthController.forgetPassword);
authRoutes.post("/reset-password", AuthController.resetPassword);
authRoutes.post("/logout", AuthController.logout);

// OAuth routes
authRoutes.post("/oauth/google", OAuthController.googleOAuth);

export default authRoutes;
