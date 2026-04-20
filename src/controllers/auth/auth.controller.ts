import { AuthService } from "@/service/auth.service.js";
import type { Request, Response } from "express";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      res.json({
        status: "success",
        data: {
          user,
        },
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { fullName, email, password } = req.body;
      const newUser = await AuthService.register(fullName, email, password);
      res.status(201).json({
        status: "success",
        data: {
          message: newUser,
        },
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }
}
