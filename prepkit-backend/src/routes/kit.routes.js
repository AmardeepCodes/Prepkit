import express from "express";
import { z } from "zod";

import * as kitController from "../controllers/kit.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// Every kit route needs a logged-in user.
router.use(requireAuth);

const createKitSchema = z.object({
  jd: z.string().min(1, "Job description is required."),
  companyUrl: z.string().url("Enter a valid company URL."),
  days: z.number().int().min(1).max(60),
});

// Keep the update schema loose (partial) - the builder sends whichever
// section it just changed, not the whole kit every time.
const updateKitSchema = z.object({
  company_brief: z.any().optional(),
  role: z.any().optional(),
  questions: z.any().optional(),
  flashcards: z.any().optional(),
  schedule: z.any().optional(),
  coverage: z.any().optional(),
  status: z.enum(["draft", "generating", "ready", "failed"]).optional(),
});

router.post("/bulk", asyncHandler(kitController.createBulkKits));
router.post("/", validateBody(createKitSchema), asyncHandler(kitController.createKit));
router.get("/", asyncHandler(kitController.listKits));
router.get("/:id", asyncHandler(kitController.getKit));
router.post("/:id/generate", asyncHandler(kitController.generateKit));
router.post("/:id/regenerate", asyncHandler(kitController.regenerateKitSection));
router.patch("/:id", validateBody(updateKitSchema), asyncHandler(kitController.updateKit));
router.delete("/:id", asyncHandler(kitController.deleteKit));

export default router;