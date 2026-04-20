import { prisma } from "@/prisma/client.js";
import {
  generateAccessToken,
  generateEmailVerificationToken,
  generateRefreshToken,
} from "@/util/generateToken";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service";

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
      throw new Error("Full name, email, and password are required");
    }

    const hashedPassword = await argon2.hash(password);
    const emailVerificationToken =
      generateEmailVerificationToken(normalizedEmail);

    // check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
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
      throw new Error("Email and password are required");
    }

    // find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found!");
    }

    // verify password
    const isPasswordValid = await argon2.verify(user.passwordHash!, password);

    if (!isPasswordValid) {
      throw new Error("Invalid email address or password");
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      user,
    };
  }

  static async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new Error("Refresh token is required");
    }

    // find user by refresh token
    const user = await prisma.refreshToken.findFirst({
      where: { token: oldRefreshToken },
    });

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // verify refresh token
    try {
      jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      throw new Error("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async verifyEmail(token: string) {
    if (!token) {
      throw new Error("Verification token is required");
    }

    // find user by verification token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new Error("Invalid verification token");
    }

    // verify token
    try {
      jwt.verify(token, process.env.EMAIL_VERIFICATION_TOKEN_SECRET!);
    } catch (err) {
      throw new Error("Invalid verification token");
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
}
