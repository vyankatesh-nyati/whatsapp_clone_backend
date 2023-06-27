const mongoose = require("mongoose");

const chatsSchema = require("./chats");
const lastChatSchema = require("./lastChat");

const Schema = mongoose.Schema;

const userChatSchema = new Schema({
  userID: {
    type: String,
    required: true,
  },
  contacts: [lastChatSchema],
  chats: [chatsSchema],
});

module.exports = mongoose.model("UserChat", userChatSchema);
