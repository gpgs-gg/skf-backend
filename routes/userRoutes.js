// routes/userRoutes.js

import express from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  checkUserByEmail,
} from "../controllers/userController.js";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// USER ROUTES
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// CHECK USER
router.get("/check/:email", checkUserByEmail);

export default router;
