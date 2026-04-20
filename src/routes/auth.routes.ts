import { AuthController } from "@/controllers/auth/auth.controller.js";
import { Router } from "express";

const authRoutes: Router = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.post("/register", AuthController.register);

export default authRoutes;
