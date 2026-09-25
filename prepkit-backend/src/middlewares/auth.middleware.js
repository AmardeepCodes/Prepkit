import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError(401, "NOT_AUTHENTICATED", "You need to log in first."));
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return next(new AppError(401, "NOT_AUTHENTICATED", "Session expired or invalid."));
  }
}