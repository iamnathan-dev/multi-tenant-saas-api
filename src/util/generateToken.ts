import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ApiError } from "./ApiError";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const EMAIL_VERIFICATION_TOKEN_SECRET =
  process.env.EMAIL_VERIFICATION_TOKEN_SECRET!;

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const generateEmailVerificationToken = (userId: string) => {
  return jwt.sign({ userId }, EMAIL_VERIFICATION_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

export const generatePasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { hashedToken, rawToken };
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
  } catch (err) {
    throw new ApiError("Invalid verification token", 400);
  }
};
