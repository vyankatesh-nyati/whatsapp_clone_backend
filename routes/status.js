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

module.exports = router;
