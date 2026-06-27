import mongoose from "mongoose";
import orderedProductSchema from "../schemas/orderedProductSchema.js";

// ✅ ROOM SUBSCHEMA
const roomSchema = new mongoose.Schema({
  roomName: String,
  roomType: String,

  products: [orderedProductSchema],
});

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    WorkLog: {
      type: String,
      default: "",
    },

    WorkLog: {
      type: String,
      default: "",
    },

    orderDate: String,
    deliveryDate: String,

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "Open",
        "Pending",
        "Processing",
        "Completed",
        "Delivered",
        "Cancelled",
      ],
      default: "Open",
    },

    staffAssigned: String,

    advancePayment: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },

    notes: String,

    // ✅ rooms now have _id automatically
    rooms: [roomSchema],
  },
  { timestamps: true },
);

export default mongoose.model("SKFOrder", orderSchema);
// import mongoose from "mongoose";
// import orderedProductSchema from "../schemas/orderedProductSchema.js";

// const orderSchema = new mongoose.Schema(
//   {
//     orderNo: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       required: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//     WorkLog: {
//       type: String,
//       default: "",
//     },
//     orderDate: {
//       type: String,
//     },

//     deliveryDate: {
//       type: String,
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Partial", "Paid"],
//       default: "Pending",
//     },

//     orderStatus: {
//       type: String,
//       enum: [
//         "Open",
//         "Pending",
//         "Processing",
//         "Completed",
//         "Delivered",
//         "Cancelled",
//       ],
//       default: "Open",
//     },

//     staffAssigned: {
//       type: String,
//       default: "",
//     },

//     advancePayment: {
//       type: Number,
//       default: 0,
//     },

//     receivedAmount: {
//       type: Number,
//       default: 0,
//     },

//     dueAmount: {
//       type: Number,
//       default: 0,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//     },

//     totalAmount: {
//       type: Number,
//       default: 0,
//     },

//     notes: {
//       type: String,
//       default: "",
//     },

//     // PRODUCTS
//     products: [orderedProductSchema],
//   },
//   {
//     timestamps: true,
//   },
// );

// export default mongoose.model("Order", orderSchema);
