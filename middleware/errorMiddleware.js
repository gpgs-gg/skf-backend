const globalErrorHandler = (err, req, res, next) => {
  console.error(err);

  err.statusCode = err.statusCode || 500;

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

  res.status(err.statusCode).json({
    success: false,
    message,
  });
};

export default globalErrorHandler;
