import express from "express";
import cors from "cors";

import connectDB from "./config/db.config.js";
//  Route Import
import customerRoutes from "./routes/customerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   GLOBAL MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

/* =========================
   ROUTES DECLARATION
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   404 HANDLER
========================= */

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(globalErrorHandler);

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();

/* =========================
   UNHANDLED REJECTIONS
========================= */

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);

  process.exit(1);
});

/* =========================
   UNCAUGHT EXCEPTIONS
========================= */

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);

  process.exit(1);
});
