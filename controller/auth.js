const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const io = require("../socket");
const User = require("../models/user");
const UserChats = require("../models/userChats");

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

    const userExist = await User.find({ phoneNumber: phoneNumber });

    if (userExist.length != 0) {
      res.status(200).json({
        message: "User signin successfully",
        id: userExist[0]._id.toString(),
      });
    } else {
      const user = new User({
        phoneNumber: phoneNumber,
      });

      const response = await user.save();
      // console.log(response._id);
      res.status(200).json({
        message: "User signup successfully",
        id: response._id.toString(),
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateUserData = async (req, res, next) => {
  const userId = req.params.id;
  const name = req.body.name;
  let profileUrl =
    "https://whatsapp-clone-backend-wswi.onrender.com/images/profiles/tumor%20(1112).jpg";
  if (req.file) {
    profileUrl = `${req.protocol}://${req.hostname}/images/profiles/${req.file.originalname}`;
  }
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation Failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const foundUser = await User.findById(userId);
    foundUser.name = name;
    foundUser.profileUrl = profileUrl;
    foundUser.isOnline = true;

    const result = await foundUser.save();
    // console.log(result._id);
    const token = jwt.sign(
      {
        id: result._id,
        phoneNumber: result.phoneNumber,
        name: result.name,
      },
      process.env.SECRET_KEY
    );

    // console.log(token);
    res.status(200).json({
      message: "User data added successfully.",
      result: result,
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserDetails = async (req, res, next) => {
  const id = req.userId;
  try {
    const foundUser = await User.findById(id);
    if (!foundUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res
      .status(200)
      .json({ message: "User found successfully", data: foundUser });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.tokenValidation = async (req, res, next) => {
  const id = req.userId;

  try {
    const foundUser = await User.findById(id);
    if (!foundUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res
      .status(200)
      .json({ message: "User found successfully", data: foundUser });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  const userId = req.userId;
  const isOnline = req.body.isOnline;
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline: isOnline,
    });
    const response = await UserChats.find({ userID: userId });
    if (response.length != 0) {
      const list = response[0].contacts;
      for (let i = 0; i < list.length; i++) {
        io.getIO().to(list[i].userId).emit("status-change", {
          isOnline: isOnline,
          userId: userId,
        });
      }
    }
    res.status(200).json({
      message: "Data updated successfully",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
