const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/images/profiles"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

profileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.profileUpload = multer({
  storage: profileStorage,
  fileFilter: profileFilter,
}).single("profilePic");

chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "/images/chat"));
  },
  filename: (req, file, cb) => {
    const _id = new mongoose.Types.ObjectId();
    req._id = _id;
    cb(null, file.originalname + `_${_id}`);
  },
});

exports.chatUpload = multer({ storage: chatStorage }).single("chatImage");
