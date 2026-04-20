import { prisma } from "@/prisma/client.js";
import {
  generateAccessToken,
  generateEmailVerificationToken,
  generateRefreshToken,
} from "@/util/generateToken";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service";
import { ApiError } from "@/util/ApiError";

export const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export class AuthService {
  static async register(fullName: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName || !email || !password) {
      throw new ApiError("Full name, email, and password are required", 400);
    }

    const hashedPassword = await argon2.hash(password);
    const emailVerificationToken =
      generateEmailVerificationToken(normalizedEmail);

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError("User with this email already exists", 400);
    }

    // create new user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        emailVerificationToken,
      },
      select: safeUserSelect,
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

    // find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...safeUserSelect,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found!", 404);
    }

    // verify password
    const isPasswordValid = await argon2.verify(user.passwordHash!, password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email address or password", 401);
    }

    if (!user.isEmailVerified) {
      throw new ApiError("Email not verified. Please check your inbox.", 401);
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

    return {
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new ApiError("Refresh token is required", 400);
    }

    // find user by refresh token
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new ApiError("Invalid refresh token", 400);
    }

    // verify refresh token
    try {
      jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      throw new ApiError("Invalid refresh token", 400);
    }

    const newAccessToken = generateAccessToken(tokenRecord.user.id);
    const newRefreshToken = generateRefreshToken(tokenRecord.user.id);

    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async verifyEmail(token: string) {
    if (!token) {
      throw new ApiError("Verification token is required", 400);
    }

    // find user by verification token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new ApiError("Invalid verification token", 400);
    }

    // verify token
    try {
      jwt.verify(token, process.env.EMAIL_VERIFICATION_TOKEN_SECRET!);
    } catch (err) {
      throw new ApiError("Invalid verification token", 400);
    }

    // update user's email verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
      select: safeUserSelect,
    });

    return updatedUser;
  }

  static async logout(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
