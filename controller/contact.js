const User = require("../models/user");
const io = require("../socket");

exports.ifNumberExists = async (req, res, next) => {
  const number = req.body.phoneNumber.trim();

  try {
    const users = await User.find({ phoneNumber: number });
    if (users.length === 0) {
      res.status(200).json({
        message: "User not found",
        isFound: false,
      });
    } else {
      res.status(200).json({
        message: "User found",
        isFound: true,
        data: users[0],
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};