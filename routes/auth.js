const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controller/auth");

const router = express.Router();

// new user Signup
router.post(
  "/signup",
  [
    body("phoneNumber")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return User.findOne({ phoneNumber: value }).then((user) => {
          if (user) {
            return Promise.reject("Phone number already exists");
          }
        });
      })
      .withMessage("Enter valid unique phone number"),
  ],
  authController.newUserSignup
);

module.exports = router;
