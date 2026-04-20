import { AuthController } from "@/controllers/auth/auth.controller.js";
import { Router } from "express";

const authRoutes: Router = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.post("/refresh-token", AuthController.refreshToken);
authRoutes.post("/verify-email", AuthController.verifyEmail);
authRoutes.post("/logout", AuthController.logout);

export default authRoutes;
