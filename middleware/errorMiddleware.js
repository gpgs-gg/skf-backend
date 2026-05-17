const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let message = err.message || "Internal Server Error";

  /* =========================
     MONGOOSE INVALID OBJECT ID
  ========================= */

  if (err.name === "CastError") {
    message = "Invalid ID";
    err.statusCode = 400;
  }

  /* =========================
     DUPLICATE KEY ERROR
  ========================= */

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    message = `${field} already exists`;
    err.statusCode = 409;
  }

  /* =========================
     VALIDATION ERROR
  ========================= */

  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");

    err.statusCode = 400;
  }

  /* =========================
     JWT ERRORS
  ========================= */

  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Session expired. Please login again";
    err.statusCode = 401;
  }

  /* =========================
     FINAL RESPONSE
  ========================= */

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default globalErrorHandler;