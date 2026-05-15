import Order from "../models/Order.js";

import { generateOrderNo } from "../utils/generateOrderNo.js";
// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const orderNo = await generateOrderNo();
    const payload = {
      ...req.body,
      orderNo,
      dueAmount:
        Number(req.body.totalAmount || 0) -
        Number(req.body.receivedAmount || 0),
    };

    const order = await Order.create(payload);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET ALL ACTIVE ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isActive: true })
      .populate({
        path: "customer",
        match: { isActive: true }, // only active customers
      })
      .sort({
        createdAt: -1,
      });

    // remove orders whose customer became null
    const filteredOrders = orders.filter((order) => order.customer);

    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      data: filteredOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET ALL ORDERS
// export const getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().populate("customer").sort({
//       createdAt: -1,
//     });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       data: orders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// GET SINGLE ACTIVE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("customer");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// GET SINGLE ORDER
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("customer");

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// UPDATE ORDER
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        dueAmount:
          Number(req.body.totalAmount || 0) -
          Number(req.body.receivedAmount || 0),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// DEACTIVATE ORDER (SOFT DELETE)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// DELETE ORDER
// export const deleteOrder = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndDelete(req.params.id);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// RESTORE ORDER
export const restoreOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
      },
      {
        new: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order restored successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// UPDATE SINGLE PRODUCT
export const updateOrderProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const product = order.products.id(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    // Optional total calculation
    product.total = product.price * product.quantity;

    // Recalculate order total
    order.totalAmount = order.products.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );

    order.dueAmount = order.totalAmount - (order.receivedAmount || 0);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// DELETE SINGLE PRODUCT
// DEACTIVATE PRODUCT (SOFT DELETE)
export const deleteOrderProduct = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      isActive: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const product = order.products.id(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // SOFT DELETE
    product.isActive = false;

    // Recalculate totals using ONLY active products
    order.totalAmount = order.products.reduce((sum, item) => {
      if (item.isActive) {
        return sum + (item.total || 0);
      }
      return sum;
    }, 0);

    order.dueAmount = order.totalAmount - (order.receivedAmount || 0);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// export const deleteOrderProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     order.products = order.products.filter(
//       (p) => p._id.toString() !== productId,
//     );

//     // Recalculate total
//     order.totalAmount = order.products.reduce(
//       (sum, item) => sum + (item.total || 0),
//       0,
//     );

//     order.dueAmount = order.totalAmount - (order.receivedAmount || 0);

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Product deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
