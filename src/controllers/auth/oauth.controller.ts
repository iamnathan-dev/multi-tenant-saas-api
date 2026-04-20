import { prisma } from "@/prisma/client";
import { OAuthService } from "@/service/oauth.service";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/util/generateToken";
import { Request, Response } from "express";

export class OAuthController {
  static async googleOAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;

      const googleUser = await OAuthService.verifyGoogleToken(token);
      const user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (!user) {
        const newUser = await prisma.user.create({
          data: {
            email: googleUser.email,
            fullName: googleUser.name,
            avatarUrl: googleUser.avatar,
            isEmailVerified: true,
          },
        });

        const { passwordHash, ...safeUser } = newUser;

        return res.status(201).json({
          status: "success",
          data: {
            user_data: safeUser,
          },
        });
      }

      const existingOAuth = await prisma.oAuthAccount.findFirst({
        where: {
          provider: "google",
          providerUserId: googleUser.googleId,
        },
      });

      if (!existingOAuth) {
        await prisma.oAuthAccount.create({
          data: {
            provider: "google",
            providerUserId: googleUser.googleId,
            userId: user.id,
          },
        });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          user: { connect: { id: user.id } },
        },
      });

      const { passwordHash, ...safeUser } = user;

      res.status(200).json({
        status: "success",
        data: {
          token: accessToken,
          refreshToken,
          user_data: safeUser,
        },
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ status: "error", message: (error as Error).message });
    }
  }
}
