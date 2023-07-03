const mongoose = require("mongoose");
const statusSchema = require("./status");

const Schema = mongoose.Schema;

const othersStatusSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  profileUrl: {
    type: String,
    required: true,
  },
  statusList: {
    type: [statusSchema],
    default: [],
  },
});

module.exports = othersStatusSchema;
