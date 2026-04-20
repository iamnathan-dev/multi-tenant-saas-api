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
          user_data: user,
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

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const newAccessToken = await AuthService.refreshToken(refreshToken);
      res.json({
        status: "success",
        data: {
          token: newAccessToken,
        },
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (typeof token !== "string") {
        throw new Error("Invalid token");
      }
      await AuthService.verifyEmail(token);
      res.json({
        status: "success",
        data: {
          message: "Email verified successfully!",
        },
      });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res
        .status(status)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      await AuthService.logout(userId);
      res.json({
        status: "success",
        data: {
          message: "Logged out successfully!",
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
