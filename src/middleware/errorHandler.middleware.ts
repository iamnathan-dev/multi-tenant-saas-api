// @ts-ignore-next-line
import { ApiError } from "@/util/ApiError";
import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // fallback for unexpected errors
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
