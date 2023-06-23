const User = require("../models/user");

exports.chatDetails = async (req, res, next) => {
  const chatUserId = req.params.id;
  const userId = req.userId;

  console.log(chatUserId);

  try {
    const foundUser = await User.findById(chatUserId);
    if (!foundUser) {
      const err = new Error("User not found");
      err.statusCode = 402;
      throw err;
    }
    res.status(200).json({
      data: {
        id: foundUser._id,
        name: foundUser.name,
        profileUrl: foundUser.profileUrl,
        isOnline: foundUser.isOnline,
        chatList: [],
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.sendMessage = async(data) => {
  
}