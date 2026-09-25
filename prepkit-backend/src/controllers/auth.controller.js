import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken({ userId: user._id.toString() });

  res.status(201).json({ token, user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(401, "BAD_CREDENTIALS", "Incorrect email or password.");
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError(401, "BAD_CREDENTIALS", "Incorrect email or password.");
  }

  const token = signToken({ userId: user._id.toString() });

  res.json({ token, user: toPublicUser(user) });
}

export async function logout(req, res) {
  // Nothing to clear server-side with JWT — the frontend just deletes the
  // token it's holding. This endpoint exists so the frontend has one
  // consistent place to call regardless of auth strategy.
  res.status(204).send();
}

export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError(401, "NOT_AUTHENTICATED", "User no longer exists.");
  }
  res.json({ user: toPublicUser(user) });
}