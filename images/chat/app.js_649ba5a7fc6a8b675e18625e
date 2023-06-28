require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const courseRoutes = require("./routes/courses");
const courseDetailsRoutes = require("./routes/courseDetails");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const sessionRoutes = require("./routes/sessionDetails");
const dataRoutes = require("./routes/data");

const compression = require("compression");

const app = express();

app.use(bodyParser.json());
app.use(compression());
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/", courseRoutes);
app.use("/course", courseDetailsRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/session", sessionRoutes);
app.use("/data", dataRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ errorMessage: message, data: data });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.enwflqw.mongodb.net/${process.env.MONGO_DATABASE}`
  )
  .then((result) => {
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    const error = new Error("Problem with mongodb database connection");
    error.statusCode = 500;
    throw err;
  });
