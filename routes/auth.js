const express = require("express");
const { body } = require("express-validator");

const auth_controller = require("../controller/auth");

const router = express.Router();

// send OTP to number
router.post(
  "/login/send-otp",
  [
    body("phone_number")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Enter valid phone number"),
  ],
  auth_controller.send_otp
);

module.exports = router;
