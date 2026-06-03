import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
  },
  { _id: false },
);

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "input",
        "number",
        "textarea",
        "select",
        "date",
        "checkbox",
        "radio",
      ],
      default: "input",
    },

    placeholder: {
      type: String,
      default: "",
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [optionSchema],
      default: [],
    },

    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fields: {
      type: [fieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Category", categorySchema);
