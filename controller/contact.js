const User = require("../models/user");

exports.ifNumberExists = async (req, res, next) => {
  const number = req.body.phoneNumber.trim();

  try {
    const users = await User.find();
    if (users.length === 0) {
      res.status(200).json({
        message: "User not found",
        isFound: false,
      });
    }
    let exists = false;
    for (let i = 0; i < users.length; i++) {
      const userNumber = users[i].phoneNumber;
      const decodedNumber = userNumber.split("-")[1];
      // console.log(decodedNumber);
      if (decodedNumber === number) {
        exists = true;
      }
    }

    if (exists) {
      res.status(200).json({
        message: "User found",
        isFound: true,
      });
    } else {
      res.status(200).json({
        message: "User not found",
        isFound: false,
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
