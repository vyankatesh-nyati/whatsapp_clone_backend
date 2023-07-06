const express = require("express");
const isAuth = require("../middlerware/is-auth");
const statusController = require("../controller/status");
const multer = require("../multer");

const router = express.Router();

router.post(
  "/add-status",
  multer.statusUpload,
  isAuth,
  statusController.addStatus
);

router.post("/seen-status", isAuth, statusController.seenStatus);

module.exports = router;
