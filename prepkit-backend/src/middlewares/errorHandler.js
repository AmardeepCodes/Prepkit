export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: `No route: ${req.method} ${req.path}` },
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Something went wrong.";

  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({ error: { code, message } });
}
