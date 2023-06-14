const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.newUserSignup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const phoneNumber = req.body.phoneNumber;

    const user = new User({
      phoneNumber: phoneNumber,
    });

    const response = await user.save();
    // console.log(response._id);
    res.status(200).json({
      message: "User signup successfully",
      id: response._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
