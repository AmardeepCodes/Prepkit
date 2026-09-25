import AppError from "../utils/AppError.js";

export function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
        : "Invalid request body.";
      return next(new AppError(400, "VALIDATION_ERROR", message));
    }
    req.body = result.data;
    next();
  };
}