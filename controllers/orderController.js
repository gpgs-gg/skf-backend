import Order from "../models/Order.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { generateOrderNo } from "../utils/generateOrderNo.js";
import cloudinary from "cloudinary";
// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const orderNo = await generateOrderNo();

    const orderData =
      typeof req.body.order === "string"
        ? JSON.parse(req.body.order)
        : req.body.order;

    const payload = {
      ...orderData,
      orderNo,
    };

    // 1. MAP FILES TO PRODUCTS
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const match = file.fieldname.match(/attachments_(\d+)_(\d+)/);

        if (!match) continue;

        const roomIndex = match[1];
        const productIndex = match[2];

        const product = payload.rooms?.[roomIndex]?.products?.[productIndex];

        if (!product) continue;

        if (!product.attachments) product.attachments = [];

        product.attachments.push({
          url: result.secure_url, // ✅ THIS WAS MISSING
          public_id: result.public_id,
          originalName: file.originalname,
          type: "image",
          uploadedAt: new Date(),
        });
      }
    }

    // 2. CALCULATE TOTAL
    let total = 0;

    payload.rooms?.forEach((room) => {
      room.products?.forEach((p) => {
        const t = (p.price || 0) * (p.quantity || 1);
        p.total = t;
        total += t;
      });
    });

    payload.totalAmount = total;
    payload.dueAmount = total - (payload.receivedAmount || 0);

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
export const updateOrder = async (req, res) => {
  try {
    const orderData =
      typeof req.body.order === "string"
        ? JSON.parse(req.body.order)
        : req.body.order || {};

    const existingOrder = await Order.findById(req.params.id);

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const incomingRooms = orderData.rooms || [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const match = file.fieldname.match(/attachments_(\d+)_(\d+)/);

        if (!match) continue;

        const roomIndex = Number(match[1]);
        const productIndex = Number(match[2]);

        const product = incomingRooms?.[roomIndex]?.products?.[productIndex];

        if (!product) continue;

        if (!product.attachments) {
          product.attachments = [];
        }

        product.attachments.push({
          url: result.secure_url,
          public_id: result.public_id,
          originalName: file.originalname,
          type: "image",
          uploadedAt: new Date(),
        });
      }
    }
    const updatedRooms = [...(existingOrder.rooms || [])];

    // ==========================
    // LOOP ROOMS
    // ==========================
    console.log(
      incomingRooms.length,
      "Incoming Rooms:",
      incomingRooms.map((r) => ({
        roomName: r.roomName,
        roomType: r.roomType,
        _id: r._id,
      })),
    );
    incomingRooms.forEach((newRoom) => {
      const roomIndex = updatedRooms.findIndex((r) => {
        // match by _id only if BOTH have _id
        if (r._id && newRoom._id) {
          return r._id.toString() === newRoom._id.toString();
        }

        // otherwise match by roomType + roomName
        return (
          r.roomType === newRoom.roomType && r.roomName === newRoom.roomName
        );
      });

      console.log("=================================");
      console.log("ROOM:", newRoom.roomName);
      console.log("TYPE:", newRoom.roomType);
      console.log("FOUND INDEX:", roomIndex);

      if (roomIndex === -1) {
        console.log("ADDING NEW ROOM");
      } else {
        console.log("UPDATING EXISTING ROOM");
      }

      // ==========================
      // NEW ROOM
      // ==========================
      if (roomIndex === -1) {
        updatedRooms.push(newRoom);
        return;
      }

      // ==========================
      // EXISTING ROOM
      // ==========================
      const existingRoom = updatedRooms[roomIndex];

      const existingProducts = existingRoom.products || [];
      const incomingProducts = newRoom.products || [];

      const updatedProducts = [...existingProducts];

      incomingProducts.forEach((newProduct) => {
        const productIndex = updatedProducts.findIndex(
          (p) =>
            p._id?.toString() === newProduct._id?.toString() ||
            p.id === newProduct.id,
        );

        // ==========================
        // NEW PRODUCT
        // ==========================
        if (productIndex === -1) {
          updatedProducts.push(newProduct);
          return;
        }

        // ==========================
        // UPDATE PRODUCT
        // ==========================
        const oldProduct = updatedProducts[productIndex];

        updatedProducts[productIndex] = {
          ...oldProduct,
          ...newProduct,

          // IMPORTANT: preserve old attachments unless overwritten
          attachments: [
            ...(oldProduct.attachments || []),
            ...(newProduct.attachments || []),
          ],
        };
      });

      updatedRooms[roomIndex] = {
        ...existingRoom,
        ...newRoom,
        products: updatedProducts,
      };
    });

    // ==========================
    // CALCULATE TOTAL
    // ==========================
    let total = 0;
    console.log("Updated Rooms Count:", updatedRooms.length);
    updatedRooms.forEach((room) => {
      room.products?.forEach((p) => {
        const t = (p.price || 0) * (p.quantity || 1);
        p.total = t;
        total += t;
      });
    });

    const updatedOrder = {
      ...existingOrder.toObject(),
      ...orderData,
      rooms: updatedRooms,
      totalAmount: total,
      dueAmount: total - (orderData.receivedAmount || 0),
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updatedOrder },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
// UPDATE ROOM + ADD NEW PRODUCTS ONLY
export const updateOrderRoom = async (req, res) => {
  try {
    const { orderId, roomId } = req.params;

    const roomData =
      typeof req.body.room === "string"
        ? JSON.parse(req.body.room)
        : req.body.room;

    const order = await Order.findById(orderId);

    const room = order.rooms.id(roomId);

    room.roomType = roomData.roomType;
    room.roomName = roomData.roomName;

    const incomingProducts = roomData.products || [];

    // upload files
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });

        const match = file.fieldname.match(/attachments(?:_product)?_(\d+)/);

        if (!match) continue;

        const productIndex = Number(match[1]);

        if (incomingProducts[productIndex]) {
          incomingProducts[productIndex].attachments = [
            ...(incomingProducts[productIndex].attachments || []),
            {
              url: result.secure_url,
              public_id: result.public_id,
              originalName: file.originalname,
              type: "image",
              uploadedAt: new Date(),
            },
          ];
        }
      }
    }

    incomingProducts.forEach((newProduct) => {
      const existingIndex = room.products.findIndex(
        (p) => p._id?.toString() === newProduct._id?.toString(),
      );

      if (existingIndex === -1) {
        room.products.push(newProduct);
      }
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

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
    const { orderId, roomId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const room = order.rooms.id(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const product = room.products.id(productId);
    console.log("DB ATTACHMENTS BEFORE UPDATE:", product.attachments);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // =========================
    // 1. HANDLE TEXT FIELDS
    // =========================
    Object.keys(req.body).forEach((key) => {
      // if product comes as JSON string
      if (key === "product") {
        const parsed = JSON.parse(req.body.product);

        const incomingAttachments = parsed.attachments || [];

        delete parsed.attachments;

        Object.assign(product, parsed);

        // overwrite existing attachments with what frontend sent
        product.attachments = incomingAttachments;
      } else {
        product[key] = req.body[key];
      }
    });
    // console.log("FILES:", req.files);
    // console.log("BODY:", req.body);
    // =========================
    // 2. HANDLE FILE UPLOADS
    // =========================
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });

          return {
            url: result.secure_url,
            public_id: result.public_id,
            originalName: file.originalname,
            type: "image",
            uploadedAt: new Date(),
          };
        }),
      );

      // merge with existing attachments
      product.attachments = [...(product.attachments || []), ...uploadedImages];
    }
    console.log("ATTACHMENTS AFTER MERGE:", product.attachments);
    // =========================
    // 3. RECALCULATE TOTAL
    // =========================
    product.total = (product.price || 0) * (product.quantity || 1);

    let total = 0;

    order.rooms.forEach((room) => {
      room.products.forEach((p) => {
        if (p.isActive) {
          total += p.total || 0;
        }
      });
    });

    order.totalAmount = total;
    order.dueAmount = total - (order.receivedAmount || 0);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addOrderProduct = async (req, res) => {
  try {
    const { orderId, roomId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const room = order.rooms.id(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // =========================
    // FILES FROM MULTER
    // =========================
    const files = req.files || [];

    const attachments = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer);

        return {
          url: result.secure_url,
          public_id: result.public_id,
          originalName: file.originalname,
          type: file.mimetype.startsWith("image") ? "image" : "file",
        };
      }),
    );

    // =========================
    // CREATE PRODUCT
    // =========================
    const newProduct = {
      ...req.body,
      attachments,
      total: (req.body.price || 0) * (req.body.quantity || 1),
      isActive: true,
    };

    room.products.push(newProduct);

    // =========================
    // RECALCULATE TOTAL
    // =========================
    let total = 0;

    order.rooms.forEach((r) => {
      r.products.forEach((p) => {
        if (p.isActive !== false) {
          total += p.total || 0;
        }
      });
    });

    order.totalAmount = total;
    order.dueAmount = total - (order.receivedAmount || 0);

    await order.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
// DELETE SINGLE PRODUCT
// DEACTIVATE PRODUCT (SOFT DELETE)
// DELETE SINGLE PRODUCT
export const deleteOrderProduct = async (req, res) => {
  try {
    const { orderId, roomId, productId } = req.params;

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

    // FIND ROOM
    const room = order.rooms.id(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // FIND PRODUCT
    const product = room.products.id(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // SOFT DELETE
    product.isActive = false;

    // RECALCULATE TOTALS
    let total = 0;

    order.rooms.forEach((room) => {
      room.products.forEach((p) => {
        if (p.isActive) {
          total += p.total || 0;
        }
      });
    });

    order.totalAmount = total;

    order.dueAmount = total - (order.receivedAmount || 0);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE ROOM
export const deleteOrderRoom = async (req, res) => {
  try {
    const { orderId, roomId } = req.params;

    // FIND ORDER
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

    // FIND ROOM
    const room = order.rooms.id(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // REMOVE ROOM
    order.rooms.pull(roomId);

    // =========================
    // RECALCULATE TOTALS
    // =========================

    let total = 0;

    order.rooms.forEach((room) => {
      room.products.forEach((p) => {
        if (p.isActive !== false) {
          total += p.total || 0;
        }
      });
    });

    order.totalAmount = total;

    order.dueAmount = total - (order.receivedAmount || 0);

    // SAVE
    await order.save();

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ROOM ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// import Order from "../models/Order.js";

// import { generateOrderNo } from "../utils/generateOrderNo.js";
// // CREATE ORDER
// export const createOrder = async (req, res) => {
//   try {
//     const orderNo = await generateOrderNo();
//     const payload = {
//       ...req.body,
//       orderNo,
//       dueAmount:
//         Number(req.body.totalAmount || 0) -
//         Number(req.body.receivedAmount || 0),
//     };

//     const order = await Order.create(payload);

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// // GET ALL ACTIVE ORDERS
// export const getOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ isActive: true })
//       .populate({
//         path: "customer",
//         match: { isActive: true }, // only active customers
//       })
//       .sort({
//         createdAt: -1,
//       });

//     // remove orders whose customer became null
//     const filteredOrders = orders.filter((order) => order.customer);

//     res.status(200).json({
//       success: true,
//       count: filteredOrders.length,
//       data: filteredOrders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// // GET ALL ORDERS
// // export const getOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find().populate("customer").sort({
// //       createdAt: -1,
// //     });

// //     res.status(200).json({
// //       success: true,
// //       count: orders.length,
// //       data: orders,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };
// // GET SINGLE ACTIVE ORDER
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       isActive: true,
//     }).populate("customer");

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
// // GET SINGLE ORDER
// // export const getOrderById = async (req, res) => {
// //   try {
// //     const order = await Order.findById(req.params.id).populate("customer");

// //     if (!order) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Order not found",
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       data: order,
// //     });
// //   } catch (error) {
// //     res.status(500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// // UPDATE ORDER
// export const updateOrder = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         dueAmount:
//           Number(req.body.totalAmount || 0) -
//           Number(req.body.receivedAmount || 0),
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order updated successfully",
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// // DEACTIVATE ORDER (SOFT DELETE)
// export const deleteOrder = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         isActive: false,
//       },
//       {
//         new: true,
//       },
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order deactivated successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // RESTORE ORDER
// export const restoreOrder = async (req, res) => {
//   try {
//     const order = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         isActive: true,
//       },
//       {
//         new: true,
//       },
//     );

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Order restored successfully",
//       data: order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// // UPDATE SINGLE PRODUCT
// export const updateOrderProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;

//     const order = await Order.findById(orderId);

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     const product = order.products.id(productId);

//     if (!product || !product.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // Update fields
//     Object.keys(req.body).forEach((key) => {
//       product[key] = req.body[key];
//     });

//     // Optional total calculation
//     product.total = product.price * product.quantity;

//     // Recalculate order total
//     order.totalAmount = order.products.reduce(
//       (sum, item) => sum + (item.total || 0),
//       0,
//     );

//     order.dueAmount = order.totalAmount - (order.receivedAmount || 0);

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// // DELETE SINGLE PRODUCT
// // DEACTIVATE PRODUCT (SOFT DELETE)
// export const deleteOrderProduct = async (req, res) => {
//   try {
//     const { orderId, productId } = req.params;

//     const order = await Order.findOne({
//       _id: orderId,
//       isActive: true,
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     const product = order.products.id(productId);

//     if (!product || !product.isActive) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // SOFT DELETE
//     product.isActive = false;

//     // Recalculate totals using ONLY active products
//     order.totalAmount = order.products.reduce((sum, item) => {
//       if (item.isActive) {
//         return sum + (item.total || 0);
//       }
//       return sum;
//     }, 0);

//     order.dueAmount = order.totalAmount - (order.receivedAmount || 0);

//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Product deactivated successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
