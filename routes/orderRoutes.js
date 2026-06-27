import express from "express";
import { verifyJWT } from "../middleware/verifyJWT.js";
<<<<<<< HEAD
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "cloudinary";
=======
>>>>>>> cd6a24d38729bbd686f95333b88749ea8b56c878
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderProduct,
  deleteOrderProduct,
  updateOrderRoom,
  deleteOrderRoom,
  addOrderProduct,
} from "../controllers/orderController.js";

const router = express.Router();

<<<<<<< HEAD
// ORDERS
router.post(
  "/",
  verifyJWT,
  upload.any(), // or upload.array("attachments", 50)
  createOrder,
);
router.get("/", verifyJWT, getOrders);
router.get("/:id", verifyJWT, getOrderById);
router.put("/:id", verifyJWT, upload.any(), updateOrder);
router.delete("/:id", verifyJWT, deleteOrder);

router.put(
  "/:orderId/rooms/:roomId/products/:productId",
  verifyJWT,
  upload.any(), // ✅ ADD THIS
  updateOrderProduct,
);
router.post(
  "/:orderId/rooms/:roomId/products",
  verifyJWT,
  upload.any(),
  addOrderProduct,
);
// PRODUCTS (nested inside rooms)
// router.put(
//   "/:orderId/rooms/:roomId/products/:productId",
//   verifyJWT,
//   updateOrderProduct,
// );
=======
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
>>>>>>> cd6a24d38729bbd686f95333b88749ea8b56c878

router.delete(
  "/:orderId/rooms/:roomId/products/:productId",
  verifyJWT,
  deleteOrderProduct,
);
// UPDATE ROOM
router.put("/:orderId/rooms/:roomId", verifyJWT, upload.any(), updateOrderRoom);
export default router;

// DELETE ROOM
router.delete("/:orderId/rooms/:roomId", verifyJWT, deleteOrderRoom);

// import express from "express";
// import { verifyJWT } from "../middleware/verifyJWT.js";
// import {
//   createOrder,
//   getOrders,
//   getOrderById,
//   updateOrder,
//   deleteOrder,
//   updateOrderProduct,
//   deleteOrderProduct,
// } from "../controllers/orderController.js";

// const router = express.Router();

// // CREATE ORDER
// router.post("/", verifyJWT, createOrder);
// //http://localhost:5000/api/orders

// // GET ALL ORDERS
// router.get("/", verifyJWT, getOrders);
// // GET http://localhost:5000/api/orders
// // GET SINGLE ORDER
// router.get("/:id", verifyJWT, getOrderById);

// // UPDATE ORDER
// router.put("/:id", verifyJWT, updateOrder);

// // DELETE ORDER
// router.delete("/:id", verifyJWT, deleteOrder);
// // UPDATE PRODUCT
// router.put("/:orderId/products/:productId", verifyJWT, updateOrderProduct);

// // DELETE PRODUCT
// router.delete("/:orderId/products/:productId", verifyJWT, deleteOrderProduct);

// export default router;
