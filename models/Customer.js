import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    alternateMobile: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    referenceBy: {
      type: String,
      default: "",
    },

    siteVisitDate: {
      type: Date,
    },

    notes: {
      type: String,
      default: "",
    },
  WorkLog: {
      type: String,
      default: "",
    },
    // 🔥 Useful Business Fields

    // customerType: {
    //   type: String,
    //   enum: ["Retail", "Dealer", "Builder", "Interior Designer"],
    //   default: "Retail",
    // },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Customer", customerSchema);
