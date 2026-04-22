import { RequestHandler } from "express";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export type Route = {
  method: Method;
  path: string;
  handlers: RequestHandler[];
};
