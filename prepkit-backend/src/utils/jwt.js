import jwt from "jsonwebtoken";
import env from "../config/env.js";

const EXPIRES_IN = "30d";

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET); // throws if invalid/expired
}