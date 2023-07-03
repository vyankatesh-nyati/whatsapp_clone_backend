const mongoose = require("mongoose");

const chatsSchema = require("./sub_models/chats");
const lastChatSchema = require("./sub_models/lastChat");

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
