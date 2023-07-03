const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const statusSchema = new Schema(
  {
    title: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: Number,
      default: 4294198070,
    },
    url: {
      type: String,
      default: "",
    },
    caption: {
      type: String,
      default: "",
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    statusType: {
      type: String,
      default: "text",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = statusSchema;
