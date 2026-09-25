import app from "./src/app.js";
import env from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("[startup] could not connect to MongoDB:", err.message);
    console.error(
      "[startup] is MongoDB running locally? Check MONGODB_URI in .env"
    );
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
    console.log(`[server] health check: http://localhost:${env.PORT}/health`);
  });
}

start();