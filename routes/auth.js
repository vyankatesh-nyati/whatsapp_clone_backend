const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controller/auth");
const isAuth = require("../middlerware/is-auth");

const router = express.Router();

// new user Signup
router.post(
  "/signup",
  [
    body("phoneNumber")
      .trim()
      .not()
      .isEmpty()
      // .custom((value, { req }) => {
      //   return User.findOne({ phoneNumber: value }).then((user) => {
      //     if (user) {
      //       return Promise.reject("Phone number already exists");
      //     }
      //   });
      // })
      .withMessage("Enter valid unique phone number"),
  ],
  authController.newUserSignup
);

// update user data
router.patch(
  "/signup/:id",
  [
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Enter valid name with length greater than 0"),
  ],
  authController.updateUserData
);

router.get("/user-details", isAuth, authController.getUserDetails);

router.get("/token-validation", isAuth, authController.tokenValidation);

router.post("/change-status", isAuth, authController.changeStatus);

module.exports = router;
