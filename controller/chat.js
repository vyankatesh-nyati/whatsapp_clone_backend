const User = require("../models/user");
const UserChat = require("../models/userChats");
const io = require("../socket");

exports.chatDetails = async (req, res, next) => {
  const chatUserId = req.params.id;
  const userId = req.userId;

  // console.log(chatUserId);

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

exports.sendMessage = async (data) => {
  const senderId = data.senderId;
  const receiverId = data.receiverId;
  const senderUsersChat = await UserChat.find({ userID: senderId });
  const receiverUsersChat = await UserChat.find({ userID: receiverId });
  const saveMessage = {
    senderId: senderId,
    receiverId: receiverId,
    text: data.text,
    timesent: data.timesent,
    isSeen: data.isSeen,
  };

  if (senderUsersChat.length == 0) {
    const newSenderUsersChat = new UserChat({
      userID: senderId,
      chats: [
        {
          othersId: receiverId,
          messages: [saveMessage],
        },
      ],
    });
    await newSenderUsersChat.save();
  } else {
    const existMessage = senderUsersChat[0].chats.findIndex(
      (c) => c.othersId == receiverId
    );

    if (existMessage != -1) {
      senderUsersChat[0].chats[existMessage].messages.push(saveMessage);
    } else {
      senderUsersChat[0].chats.push({
        othersId: receiverId,
        messages: [saveMessage],
      });
    }
    await senderUsersChat[0].save();
  }

  if (receiverUsersChat.length == 0) {
    const newReceiverUsersChat = new UserChat({
      userID: receiverId,
      chats: [
        {
          othersId: senderId,
          messages: [saveMessage],
        },
      ],
    });
    await newReceiverUsersChat.save();
  } else {
    const existMessage = receiverUsersChat[0].chats.findIndex(
      (c) => c.othersId == senderId
    );

    if (existMessage != -1) {
      receiverUsersChat[0].chats[existMessage].messages.push(saveMessage);
    } else {
      receiverUsersChat[0].chats.push({
        othersId: senderId,
        messages: [saveMessage],
      });
    }
    await receiverUsersChat[0].save();
  }

  io.getIO().to(receiverId).emit("received-message", {
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: data.text,
    timesent: data.timesent,
    isSeen: data.isSeen,
  });
};
