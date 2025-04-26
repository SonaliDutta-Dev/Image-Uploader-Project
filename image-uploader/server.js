import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dfglng8d2",
  api_key: "264715678959216",
  api_secret: "LKbLwD9P8gsrz9gB5Vd7rJYqgqk",
});

app.use(express.urlencoded({ extended: true }));
mongoose
  .connect(
    "mongodb+srv://sonalidutta45bonu:sonalinodejs@cluster0.litzxn8.mongodb.net/",
    { dbName: "NodeJs_Mastery_Course" }
  )
  .then(() => console.log("MongoDb Connected..!"))
  .catch((err) => console.log(err));

// rendering ejs files
app.get("/", (req, res) => {
  res.render("index.ejs", { url: null });
});

const storage = multer.diskStorage({
//   destination: "./publuic/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const imageSchema = new mongoose.Schema({
  filename: String,
  public_id: String,
  imgurl: String,
});

const File = mongoose.model("cloudinary", imageSchema);
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file.path;

  const cloudinaryRes = await cloudinary.uploader.upload(file, {
    folder: "NodeJS_Mastery_Course",
  });

//   save to database
const db = await File.create({
    filename : file.originalname,
    public_id: cloudinaryRes.public_id,
    imgUrl: cloudinaryRes.secure_url,

});
  res.render("index.ejs", { url: cloudinaryRes.secure_url });
});

const port = 3000;

app.listen(port, () =>
  console.log(`My Server is currently running on ${port}`)
);
