const mongoose = require("mongoose");
const chatsSchema = require("./chats");

const Schema = mongoose.Schema;

const userChatSchema = new Schema({
  userID: {
    type: String,
    required: true,
  },
  chats: [chatsSchema],
});

module.exports = mongoose.model("UserChat", userChatSchema);
