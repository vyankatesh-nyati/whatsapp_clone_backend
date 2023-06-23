const express = require("express");

const isAuth = require("../middlerware/is-auth");
const chatController = require("../controller/chat");

const router = express.Router();

router.get("/chat-details/:id", isAuth, chatController.chatDetails);

module.exports = router;
