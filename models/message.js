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
});

module.exports = messageSchema;
