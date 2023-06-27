const User = require("../models/user");
const UserChat = require("../models/userChats");
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

exports.loadContactList = async (req, res, next) => {
  const userId = req.userId;

  try {
    const loadUser = await UserChat.find({ userID: userId });

    if (loadUser.length == 0) {
      res.status(200).json({
        data: [],
      });
    } else {
      const loadContactList = loadUser[0].contacts;
      const sortedList = loadContactList.sort((a, b) =>
        a.updatedAt < b.updatedAt ? 1 : -1
      );
      res.status(200).json({
        data: sortedList,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
