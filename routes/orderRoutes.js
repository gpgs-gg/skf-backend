import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderProduct,
  deleteOrderProduct,
} from "../controllers/orderController.js";

const router = express.Router();

// CREATE ORDER
router.post("/", createOrder);
//http://localhost:5000/api/orders

// GET ALL ORDERS
router.get("/", getOrders);
// GET http://localhost:5000/api/orders
// GET SINGLE ORDER
router.get("/:id", getOrderById);

// UPDATE ORDER
router.put("/:id", updateOrder);

// DELETE ORDER
router.delete("/:id", deleteOrder);
// UPDATE PRODUCT
router.put("/:orderId/products/:productId", updateOrderProduct);

// DELETE PRODUCT
router.delete("/:orderId/products/:productId", deleteOrderProduct);

export default router;
