import { prisma } from "@/prisma/client";
import { OAuthService } from "@/service/auth/oauth.service";
import { ApiError } from "@/util/ApiError";
import { issueTokens, sanitizeUser } from "@/util/auth";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/util/generateToken";
import { OAuthProvider } from "@prisma/client";
import { Request, Response } from "express";

export class OAuthController {
  static async googleOAuth(req: Request, res: Response) {
    try {
      const { token } = req.body;

      const googleUser = await OAuthService.verifyGoogleToken(token);

      const { user, isNewUser } = await OAuthService.handleOAuthLogin(
        {
          providerUserId: googleUser.googleId,
          email: googleUser.email,
          username: googleUser.name,
          avatarUrl: googleUser.avatar,
        },
        OAuthProvider.google,
      );

      const { accessToken, refreshToken } = await issueTokens(user.id);

      res.status(isNewUser ? 201 : 200).json({
        status: "success",
        data: {
          accessToken,
          refreshToken,
          user_data: sanitizeUser(user),
        },
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async githubCallback(req: Request, res: Response) {
    try {
      const { code, state } = req.query;

      if (!code) {
        throw new ApiError("Missing authorization code", 400);
      }

      let returnUrl = Buffer.from(state as string, "base64").toString("utf-8");
      if (returnUrl.startsWith("aHR0")) {
        returnUrl = Buffer.from(returnUrl, "base64").toString("utf-8");
      }

      const accessToken = await OAuthService.exchangeGitHubCode(code as string);

      const githubUser = await OAuthService.getGitHubUser(accessToken);

      const { user, isNewUser } = await OAuthService.handleOAuthLogin(
        {
          providerUserId: githubUser.githubId,
          email: githubUser.email,
          username: githubUser.username,
          avatarUrl: githubUser.avatarUrl,
        },
        OAuthProvider.github,
      );

      const tokens = await issueTokens(user.id);

      res.redirect(
        `${returnUrl}?accessToken=${tokens.accessToken}` +
          `&refreshToken=${tokens.refreshToken}` +
          `&new=${isNewUser}`,
      );
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res
        .status(statusCode)
        .json({ status: "error", message: (error as Error).message });
    }
  }

  static async githubRedirect(req: Request, res: Response) {
    const state =
      (req.query.returnUrl as string) ||
      process.env.FRONTEND_URL ||
      "http://localhost:5000";

    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&scope=user:email` +
      `&state=${Buffer.from(state).toString("base64")}`;

    res.redirect(url);
  }
}
