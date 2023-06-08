require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");

const app = express();

app.use(bodyParser.json());

app.use("/api", authRoutes);

app.use((error, req, res, next) => {
  // console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    error: message,
    data: data,
  });
});
