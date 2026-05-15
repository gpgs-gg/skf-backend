import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  checkCustomerByMobile,
} from "../controllers/customerController.js";

const router = express.Router();

// CREATE CUSTOMER
router.post("/", createCustomer);
// http://localhost:5000/api/customers

// GET ALL CUSTOMERS
router.get("/", getCustomers);
// http://localhost:5000/api/customers

// CHECK CUSTOMER MOBILE
router.get("/check-mobile/:mobile", checkCustomerByMobile);

// GET SINGLE CUSTOMER
router.get("/:id", getCustomerById);
// http://localhost:5000/api/customers/69fd9058dbf355da062cf428

// UPDATE CUSTOMER
router.put("/:id", updateCustomer);
// http://localhost:5000/api/customers/69fd9058dbf355da062cf428

// DELETE CUSTOMER
router.delete("/:id", deleteCustomer);

export default router;
