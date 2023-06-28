require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const chatRoutes = require("./routes/chat");
const chatController = require("./controller/chat");

const app = express();

app.use(bodyParser.json());

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
app.use("/api", chatRoutes);

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
      // join user to room with his mongoid
      let roomId;
      socket.on("create-room", (data) => {
        roomId = data.clientId;
        socket.join(data.clientId);
      });

      socket.on("disconnect", () => {
        socket.leave(roomId);
      });
    });
  });
