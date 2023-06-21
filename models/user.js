const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    isOnline: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
