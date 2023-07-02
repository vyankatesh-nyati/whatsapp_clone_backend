const mongoose = require("mongoose");
const User = require("../models/user");
const UserChat = require("../models/userChats");
const io = require("../socket");
const cloudinary = require("cloudinary").v2;
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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
  const _id = data._id;
  if (_id == null) {
    _id = new mongoose.Types.ObjectId();
  }
  let saveMessage;
  if (data.replyText != null) {
    saveMessage = {
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      text: data.text,
      timesent: data.timesent,
      isSeen: data.isSeen,
      type: data.type,
      replyText: data.replyText,
      messageSenderIdToReply: data.messageSenderIdToReply,
      replyMessageType: data.replyMessageType,
    };
  } else {
    saveMessage = {
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      text: data.text,
      timesent: data.timesent,
      isSeen: data.isSeen,
      type: data.type,
    };
  }

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
    replyText: data.replyText,
    messageSenderIdToReply: data.messageSenderIdToReply,
    replyMessageType: data.replyMessageType,
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
  const replyText = req.body.replyText;
  const messageSenderIdToReply = req.body.messageSenderIdToReply;
  const replyMessageType = req.body.replyMessageType;

  try {
    await sendMessage({
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      timesent: timesent,
      isSeen: isSeen,
      text: text,
      type: type,
      replyText: replyText,
      messageSenderIdToReply: messageSenderIdToReply,
      replyMessageType: replyMessageType,
    });
    if (replyText == null) {
      res.status(200).json({
        _id: _id,
        senderId: senderId,
        receiverId: receiverId,
        timesent: timesent,
        isSeen: isSeen,
        text: text,
        type: type,
        replyText: "",
        messageSenderIdToReply: "",
        replyMessageType: "text",
      });
    } else {
      res.status(200).json({
        _id: _id,
        senderId: senderId,
        receiverId: receiverId,
        timesent: timesent,
        isSeen: isSeen,
        text: text,
        type: type,
        replyText: replyText,
        messageSenderIdToReply: messageSenderIdToReply,
        replyMessageType: replyMessageType,
      });
    }
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
  const replyText = req.body.replyText;
  const messageSenderIdToReply = req.body.messageSenderIdToReply;
  const replyMessageType = req.body.replyMessageType;

  let isSeen = false;
  if (req.body.isSeen == "true") {
    isSeen = true;
  }
  const type = req.body.type;
  try {
    let result;
    // if (type === "text") {
    //   result = await cloudinary.uploader.upload(
    //     path.join(__dirname, `../images/chat/${req.file.originalname}`)
    //   );
    // } else {
    result = await cloudinary.uploader.upload(
      path.join(__dirname, `../images/chat/${req.file.originalname}`),
      { resource_type: "auto" }
    );
    // }
    await sendMessage({
      _id: _id,
      senderId: senderId,
      receiverId: receiverId,
      timesent: timesent,
      isSeen: isSeen,
      text: result.secure_url,
      type: type,
      replyText: replyText,
      messageSenderIdToReply: messageSenderIdToReply,
      replyMessageType: replyMessageType,
    });

    if (replyText == null) {
      res.status(200).json({
        _id: _id,
        senderId: senderId,
        receiverId: receiverId,
        timesent: timesent,
        isSeen: isSeen,
        text: result.secure_url,
        type: type,
        replyText: "",
        messageSenderIdToReply: "",
        replyMessageType: "text",
      });
    } else {
      res.status(200).json({
        _id: _id,
        senderId: senderId,
        receiverId: receiverId,
        timesent: timesent,
        isSeen: isSeen,
        text: result.secure_url,
        type: type,
        replyText: replyText,
        messageSenderIdToReply: messageSenderIdToReply,
        replyMessageType: replyMessageType,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
