import { Request, Response, NextFunction } from "express";
import xss from "xss";

function sanitizeObject(obj: any): any {
    console.log("oooooo",obj)
  if (!obj) return obj;

  if (typeof obj === "string") {
    return xss(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}

export const xssSanitizerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};