const express = require("express");

const multer = require("../multer");
const isAuth = require("../middlerware/is-auth");
const chatController = require("../controller/chat");

const router = express.Router();

router.get("chat/chat-details/:id", isAuth, chatController.chatDetails);

router.post("chat/send-text-message", isAuth, chatController.sendTextMessage);

router.post(
  "chat/send-file-message",
  multer.chatUpload,
  isAuth,
  chatController.sendFileMessage
);

router.post("chat/seen-message", isAuth, chatController.seenMessage);

module.exports = router;
