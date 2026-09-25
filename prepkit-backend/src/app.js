import express from "express";
import cors from "cors";
import helmet from "helmet";

import env from "./config/env.js";
import { dbState } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import kitRoutes from "./routes/kit.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const DB_STATE_LABEL = ["disconnected", "connected", "connecting", "disconnecting"];

app.get("/health", (req, res) => {
  const state = dbState();
  res.json({
    status: "ok",
    env: env.NODE_ENV,
    db: DB_STATE_LABEL[state] || "unknown",
  });
});


// Routes

app.use("/api/auth", authRoutes);
app.use("/api/kits", kitRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;