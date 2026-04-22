import { ApiError } from "@/util/ApiError";
import { verifyToken } from "@/util/generateToken";
import { NextFunction, Request, Response } from "express";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const protectedRouteMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Authorization header missing or malformed",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: (error as Error).message });
  }
};
