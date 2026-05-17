import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  checkCustomerByMobile,
} from "../controllers/customerController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
const router = express.Router();

// CREATE CUSTOMER
router.post("/", verifyJWT, createCustomer);
// http://localhost:5000/api/customers

// GET ALL CUSTOMERS
router.get("/", verifyJWT, getCustomers);
// http://localhost:5000/api/customers

// CHECK CUSTOMER MOBILE
router.get("/check-mobile/:mobile", verifyJWT, checkCustomerByMobile);

// GET SINGLE CUSTOMER
router.get("/:id", verifyJWT, getCustomerById);
// http://localhost:5000/api/customers/69fd9058dbf355da062cf428

// UPDATE CUSTOMER
router.put("/:id", verifyJWT, updateCustomer);
// http://localhost:5000/api/customers/69fd9058dbf355da062cf428

// DELETE CUSTOMER
router.delete("/:id", verifyJWT, deleteCustomer);

export default router;