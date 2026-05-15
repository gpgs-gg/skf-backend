import Counter from "../models/Counter.js";

export const generateOrderNo = async () => {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    {
      key: `order-${year}`,
    },
    {
      $inc: { seq: 1 },
    },
    {
      new: true,
      upsert: true,
    },
  );

  const sequence = String(counter.seq).padStart(3, "0");

  return `SKF-${year}-${sequence}`;
};
