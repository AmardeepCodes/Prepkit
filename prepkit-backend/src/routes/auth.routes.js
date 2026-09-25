import express from "express";
import { z } from "zod";

import * as authController from "../controllers/auth.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

router.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.me));

export default router;