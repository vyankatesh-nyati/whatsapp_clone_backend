require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");

const app = express();

app.use(bodyParser.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/images/profiles"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: storage, fileFilter: fileFilter }).single("profilePic")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.static("public"));
app.use("/images", express.static("images"));

app.use("/api", authRoutes);
app.use("/api", contactRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    error: message,
    data: data,
  });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ltpsjjc.mongodb.net/${process.env.DB_NAME}`
  )
  .then(() => {
    console.log("Database connected successfully");
    const server = app.listen(process.env.PORT || 8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  });
