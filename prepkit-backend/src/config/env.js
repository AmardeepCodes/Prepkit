import "dotenv/config";

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(
      `Missing required environment variable: ${name}. Check .env.example.`
    );
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 4000),
  MONGODB_URI: required("MONGODB_URI", "mongodb://127.0.0.1:27017/prepkit"),
  JWT_SECRET: required("JWT_SECRET", "dev-only-secret-change-me"),
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

export default env;