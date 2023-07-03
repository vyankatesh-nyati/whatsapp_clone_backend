const mongoose = require("mongoose");

const messageSchema = require("./message");

const Schema = mongoose.Schema;

const chatsSchema = new Schema({
  othersId: {
    type: String,
    required: true,
  },
  messages: [messageSchema],
});

module.exports = chatsSchema;
