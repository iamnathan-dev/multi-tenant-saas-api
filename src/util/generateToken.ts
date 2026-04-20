import jwt from "jsonwebtoken";

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
