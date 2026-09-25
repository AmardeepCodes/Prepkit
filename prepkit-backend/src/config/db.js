import mongoose from "mongoose";
import env from "./env.js";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  isConnected = true;

  console.log(`[db] connected to MongoDB (${mongoose.connection.name})`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected");
    isConnected = false;
  });

  return mongoose.connection;
}

export function dbState() {
  return mongoose.connection.readyState;
}