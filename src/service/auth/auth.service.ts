import { prisma } from "@/prisma/client.js";
import {
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from "@/util/generateToken";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service";
import { ApiError } from "@/util/ApiError";
import crypto from "crypto";
import { issueTokens, sanitizeUser } from "@/util/auth";

export class AuthService {
  static async register(fullName: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName || !email || !password) {
      throw new ApiError("Full name, email, and password are required", 400);
    }

    const hashedPassword = await argon2.hash(password);
    const emailVerificationToken =
      generateEmailVerificationToken(normalizedEmail);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError("User with this email already exists", 400);
    }

    await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        emailVerificationToken,
      },
    });

    EmailService.sendVerificationEmail(
      normalizedEmail,
      emailVerificationToken,
    ).catch(console.error);

    return "Registration successful! Please check your email to verify your account.";
  }

  static async login(email: string, password: string) {
    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError("User not found!", 404);
    }

    const isPasswordValid = await argon2.verify(user.passwordHash!, password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email address or password", 401);
    }

    if (!user.isEmailVerified) {
      throw new ApiError("Email not verified. Please check your inbox.", 401);
    }

    const { accessToken, refreshToken } = await issueTokens(user.id);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new ApiError("Refresh token is required", 400);
    }

    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new ApiError("Invalid refresh token", 400);
    }

    try {
      jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      throw new ApiError("Invalid refresh token", 400);
    }

    const { accessToken, refreshToken } = await issueTokens(tokenRecord.userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  static async verifyEmail(token: string) {
    if (!token) {
      throw new ApiError("Verification token is required", 400);
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ApiError("Invalid verification token", 400);
    }

    try {
      jwt.verify(token, process.env.EMAIL_VERIFICATION_TOKEN_SECRET!);
    } catch (err) {
      throw new ApiError("Invalid verification token", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    return sanitizeUser(updatedUser);
  }

  static async forgetPassword(email: string) {
    if (!email) {
      throw new ApiError("Email is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const { hashedToken, rawToken } = generatePasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    EmailService.sendPasswordResetEmail(email, rawToken).catch(console.error);

    return "Password reset email sent! Please check your inbox.";
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) {
      throw new ApiError("Token and new password are required", 400);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ApiError("Invalid or expired password reset token", 400);
    }

    const hashedPassword = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return "Password has been reset successfully!";
  }

  static async logout(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  static async deleteAccount(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return "Account deleted successfully!";
  }
}
