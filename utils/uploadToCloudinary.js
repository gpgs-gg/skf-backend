import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (fileBuffer) => {
  const base64 = fileBuffer.toString("base64");

  return await cloudinary.uploader.upload(`data:image/webp;base64,${base64}`, {
    folder: "products",
    resource_type: "image",
  });
};
// import streamifier from "streamifier";
// import cloudinary from "../config/cloudinary.js";

// export const uploadToCloudinary = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder: "products",
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       },
//     );

//     streamifier.createReadStream(fileBuffer).pipe(stream);
//   });
// };
