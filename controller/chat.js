const mongoose = require("mongoose");
const User = require("../models/user");
const UserChat = require("../models/userChats");
const io = require("../socket");

exports.chatDetails = async (req, res, next) => {
  const chatUserId = req.params.id;
  const userId = req.userId;

  try {
    const foundUser = await User.findById(chatUserId);
    if (!foundUser) {
      const err = new Error("User not found");
      err.statusCode = 402;
      throw err;
    }
    const userChats = await UserChat.find({ userID: userId });
    let chatsIndex = -1;
    if (userChats.length != 0) {
      chatsIndex = userChats[0].chats.findIndex(
        (c) => c.othersId == chatUserId
      );
    }
    if (chatsIndex == -1) {
      res.status(200).json({
        data: {
          id: foundUser._id,
          name: foundUser.name,
          profileUrl: foundUser.profileUrl,
          isOnline: foundUser.isOnline,
          chatList: [],
        },
      });
    } else {
      res.status(200).json({
        data: {
          id: foundUser._id,
          name: foundUser.name,
          profileUrl: foundUser.profileUrl,
          isOnline: foundUser.isOnline,
          chatList: userChats[0].chats[chatsIndex].messages,
        },
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

const sendMessage = async (data) => {
  const senderId = data.senderId;
  const receiverId = data.receiverId;

  const senderUsersChat = await UserChat.find({ userID: senderId });
  const receiverUsersChat = await UserChat.find({ userID: receiverId });
  const senderUser = await User.findById(senderId);
  const receiverUser = await User.findById(receiverId);

  const saveMessage = {
    _id: data._id,
    senderId: senderId,
    receiverId: receiverId,
    text: data.text,
    timesent: data.timesent,
    isSeen: data.isSeen,
    type: data.type,
  };

  if (senderUsersChat.length == 0) {
    const newSenderUsersChat = new UserChat({
      userID: senderId,
      contacts: [
        {
          userId: receiverId,
          name: receiverUser.name,
          profileUrl: receiverUser.profileUrl,
          timesent: data.timesent,
          text: data.text,
          type: data.type,
        },
      ],
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
    const contactIndx = senderUsersChat[0].contacts.findIndex(
      (c) => c.userId == receiverId
    );

    if (existMessage != -1) {
      senderUsersChat[0].chats[existMessage].messages.push(saveMessage);
    } else {
      senderUsersChat[0].chats.push({
        othersId: receiverId,
        messages: [saveMessage],
      });
    }

    if (contactIndx != -1) {
      senderUsersChat[0].contacts[contactIndx] = {
        userId: receiverId,
        name: receiverUser.name,
        profileUrl: receiverUser.profileUrl,
        timesent: data.timesent,
        text: data.text,
        type: data.type,
      };
    } else {
      senderUsersChat[0].contacts.push({
        userId: receiverId,
        name: receiverUser.name,
        profileUrl: receiverUser.profileUrl,
        timesent: data.timesent,
        text: data.text,
        type: data.type,
      });
    }

    await senderUsersChat[0].save();
  }

  if (receiverUsersChat.length == 0) {
    const newReceiverUsersChat = new UserChat({
      userID: receiverId,
      contacts: [
        {
          userId: senderId,
          name: senderUser.name,
          profileUrl: senderUser.profileUrl,
          timesent: data.timesent,
          text: data.text,
          type: data.type,
        },
      ],
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
    const contactIndx = receiverUsersChat[0].contacts.findIndex(
      (c) => c.userId == senderId
    );

    if (existMessage != -1) {
      receiverUsersChat[0].chats[existMessage].messages.push(saveMessage);
    } else {
      receiverUsersChat[0].chats.push({
        othersId: senderId,
        messages: [saveMessage],
      });
    }

    if (contactIndx != -1) {
      receiverUsersChat[0].contacts[contactIndx] = {
        userId: senderId,
        name: senderUser.name,
        profileUrl: senderUser.profileUrl,
        timesent: data.timesent,
        text: data.text,
        type: data.type,
      };
    } else {
      receiverUsersChat[0].contacts.push({
        userId: senderId,
        name: senderUser.name,
        profileUrl: senderUser.profileUrl,
        timesent: data.timesent,
        text: data.text,
        type: data.type,
      });
    }
    await receiverUsersChat[0].save();
  }

  io.getIO().to(senderId).emit("send-message-received", {
    _id: saveMessage._id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: data.text,
    timesent: data.timesent,
    isSeen: data.isSeen,
    type: data.type,
  });

  io.getIO().to(receiverId).emit("received-message", {
    _id: saveMessage._id,
    senderId: data.senderId,
    receiverId: data.receiverId,
    text: data.text,
    timesent: data.timesent,
    isSeen: data.isSeen,
    name: senderUser.name,
    profileUrl: senderUser.profileUrl,
    type: data.type,
  });
};

exports.sendTextMessage = async (req, res, next) => {
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const text = req.body.text;
  const timesent = req.body.timesent;
  const isSeen = req.body.isSeen;
  const type = req.body.type;
  const _id = new mongoose.Types.ObjectId();

  try {
    await sendMessage({
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      timesent: timesent,
      isSeen: isSeen,
      text: text,
      type: type,
    });
    res.status(200).json({
      messageId: _id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sendFileMessage = async (req, res, next) => {
  const _id = req._id;
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId;
  const timesent = req.body.timesent;
  const isSeen = req.body.isSeen;
  const type = req.body.type;
  let fileUrl;
  if (req.file) {
    fileUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}/images/chat/${req.file.originalname}_${_id}`;
  }
  try {
    await sendMessage({
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      timesent: timesent,
      isSeen: isSeen,
      text: fileUrl,
      type: type,
    });
    res.status(200).json({
      messageId: _id,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
