import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
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
router.post("/", verifyJWT, createOrder);
//http://localhost:5000/api/orders

// GET ALL ORDERS
router.get("/", verifyJWT, getOrders);
// GET http://localhost:5000/api/orders
// GET SINGLE ORDER
router.get("/:id", verifyJWT, getOrderById);

// UPDATE ORDER
router.put("/:id", verifyJWT, updateOrder);

// DELETE ORDER
router.delete("/:id", verifyJWT, deleteOrder);
// UPDATE PRODUCT
router.put("/:orderId/products/:productId", verifyJWT, updateOrderProduct);

// DELETE PRODUCT
router.delete("/:orderId/products/:productId", verifyJWT, deleteOrderProduct);

export default router;
