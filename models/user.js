const mongoose = require("mongoose");

const statusSchema = require("./status");
const othersStatusSchema = require("./othersStatus");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    profileUrl: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    myStatusList: {
      type: [statusSchema],
      default: [],
    },
    othersStatusList: {
      type: [othersStatusSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
