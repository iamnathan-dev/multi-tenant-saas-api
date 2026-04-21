import { prisma } from "@/prisma/client";
import { ApiError } from "@/util/ApiError";
import { OAuthProvider } from "@prisma/client";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class OAuthService {
  static async verifyGoogleToken(token: string) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new ApiError("Invalid token payload", 400);
      }

      return {
        googleId: payload.sub!,
        email: payload.email!,
        name: payload.name!,
        avatar: payload.picture!,
      };
    } catch (err) {
      throw new ApiError("Invalid Google token", 400);
    }
  }

  // github OAuth
  static async getGitHubAccessToken(code: string) {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    return response.data.access_token;
  }

  static async getGitHubUser(accessToken: string) {
    const [userRes, emailRes] = await Promise.all([
      axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const primaryEmail = emailRes.data.find((e: any) => e.primary)?.email;

    return {
      githubId: String(userRes.data.id),
      username: userRes.data.login,
      avatarUrl: userRes.data.avatar_url,
      email: primaryEmail,
    };
  }

  static async handleOAuthLogin(
    data: {
      providerUserId: string;
      email?: string;
      username?: string;
      avatarUrl?: string;
    },
    provider: OAuthProvider,
  ): Promise<{ user: any; isNewUser: boolean }> {
    // 1. check if OAuth account already exists
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: data.providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth) {
      return { user: existingOAuth.user, isNewUser: false };
    }

    // 2. try to find user by email (account linking)
    let user = null;

    if (data.email) {
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });
    }

    let isNewUser = false;

    // 3. create user if not exists (WITH OAuthAccount nested)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email:
            data.email ??
            `${data.providerUserId}@${provider.toLowerCase()}.local`,
          fullName: data.username,
          avatarUrl: data.avatarUrl,
          isEmailVerified: true,
          oauthAccounts: {
            create: {
              provider,
              providerUserId: data.providerUserId,
            },
          },
        },
      });

      isNewUser = true;
      return { user, isNewUser };
    }

    // 4. if user exists → link OAuth account if not already linked
    await prisma.oAuthAccount.create({
      data: {
        provider,
        providerUserId: data.providerUserId,
        userId: user.id,
      },
    });

    return { user, isNewUser };
  }

  static async exchangeGitHubCode(code: string): Promise<string> {
    const res = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        transformRequest: [
          (data) =>
            Object.entries(data)
              .map(
                ([k, v]) =>
                  `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`,
              )
              .join("&"),
        ],
      },
    );

    const accessToken = res.data?.access_token;

    if (!accessToken) {
      throw new Error("GitHub OAuth failed: no access token returned");
    }

    return accessToken;
  }
}
