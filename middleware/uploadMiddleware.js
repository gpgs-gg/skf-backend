import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
export default upload;

// import multer from "multer";

// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // optional safety
// });

// export default upload;
