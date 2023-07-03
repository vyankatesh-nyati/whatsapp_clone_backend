const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timesent: {
    type: String,
    required: true,
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    required: true,
  },
  replyText: {
    type: String,
    default: "",
  },
  messageSenderIdToReply: {
    type: String,
    default: "",
  },
  replyMessageType: {
    type: String,
    default: "text",
  },
});

module.exports = messageSchema;
