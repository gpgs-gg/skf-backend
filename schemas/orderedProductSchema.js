import mongoose from "mongoose";

const orderedProductSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    name: String,

    productCode: String,

    brand: String,

    quantity: {
      type: Number,
      default: 1,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    price: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    collectionName: String,
    companyName: String,
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Completed",
        "Delivered",
        "Open",
        "Cancelled",
      ],
      default: "Open",
    },

    deliveryDate: String,

    specialNotes: String,

    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    attachments: [
      {
        url: String,
        public_id: String,
        originalName: String,
        type: {
          type: String, // image | pdf | video | other
          default: "image",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    _id: true, // IMPORTANT
  },
);

export default orderedProductSchema;
