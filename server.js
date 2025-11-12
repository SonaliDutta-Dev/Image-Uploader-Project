import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config(); // load env vars

const app = express();

// basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// mongoDB connect
mongoose
  .connect(process.env.MONGO_URI, { dbName: "NodeJs_Mastery_Course" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// view engine (if you’re rendering ejs files)
app.set("view engine", "ejs");

// default route
app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

// multer setup
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// mongoose model
const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgUrl: String,
});
const File = mongoose.model("cloudinary", imageSchema);

// upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // upload to cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(req.file.path, {
      folder: "NodeJS_Mastery_Course",
    });

    // save in DB
    await File.create({
      filename: req.file.originalname,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

    res.render("index.ejs", { url: cloudinaryRes.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Error uploading file");
  }
});

// dynamic port for render
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
