const express = require("express");

const multer = require("../multer");
const isAuth = require("../middlerware/is-auth");
const chatController = require("../controller/chat");

const router = express.Router();

router.get("chat-details/:id", isAuth, chatController.chatDetails);

router.post("send-text-message", isAuth, chatController.sendTextMessage);

router.post(
  "send-file-message",
  multer.chatUpload,
  isAuth,
  chatController.sendFileMessage
);

router.post("seen-message", isAuth, chatController.seenMessage);

module.exports = router;
