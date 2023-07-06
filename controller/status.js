const User = require("../models/user");
const io = require("../socket");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const path = require("path");

exports.addStatus = async (req, res, next) => {
  const title = req.body.title;
  const backgroundColor = parseInt(req.body.backgroundColor);
  const fontSize = parseFloat(req.body.fontSize);
  const caption = req.body.caption;
  const statusType = req.body.statusType;
  const userId = req.userId;
  let _id = req._id;
  const contactList = req.body.contactList.split(",");

  let isSeen = false;
  if (req.body.isSeen == "true") {
    isSeen = true;
  }

  if (_id == null) {
    _id = new mongoose.Types.ObjectId();
  }
  let url = "";

  try {
    if (statusType != "text") {
      const result = await cloudinary.uploader.upload(
        path.join(__dirname, `../images/status/${req.file.originalname}`),
        { resource_type: "auto" }
      );
      url = result.secure_url;
    }

    const newStatus = {
      _id: _id,
      title: title,
      backgroundColor: backgroundColor,
      fontSize: fontSize,
      url: url,
      caption: caption,
      isSeen: isSeen,
      statusType: statusType,
    };

    const foundUser = await User.findById(userId);

    foundUser.myStatusList.push(newStatus);

    const updatedUser = await foundUser.save();

    const users = await User.find();

    for (let i = 0; i < users.length; i++) {
      let isContain = contactList.includes(users[i].phoneNumber);

      if (isContain) {
        // console.log(users[i]._id.toString());
        io.getIO().to(users[i]._id.toString()).emit("added-status", {
          _id: _id,
          title: title,
          backgroundColor: backgroundColor,
          fontSize: fontSize,
          url: url,
          caption: caption,
          isSeen: isSeen,
          statusType: statusType,
          userId: userId,
          name: foundUser.name,
          profileUrl: foundUser.profileUrl,
          createdAt: updatedUser.createdAt,
        });
        const statusIndex = users[i].othersStatusList.findIndex(
          (status) => status.userId == userId
        );
        if (statusIndex == -1) {
          users[i].othersStatusList.push({
            userId: userId,
            name: updatedUser.name,
            profileUrl: updatedUser.profileUrl,
            statusList: [newStatus],
          });
        } else {
          users[i].othersStatusList[statusIndex].statusList.push(newStatus);
        }
        await users[i].save();
      }
    }

    res.status(200).json({
      message: "status added successfully",
      data: updatedUser.myStatusList[updatedUser.myStatusList.length - 1],
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.seenStatus = async (req, res, next) => {
  const statusId = req.body.statusId;
  const userId = req.userId;
  const isSeen = req.body.isSeen;
  const othersId = req.body.othersId;
  try {
    const foundUser = await User.findById(userId);
    let foundIndex;
    if (othersId == "") {
      foundIndex = foundUser.myStatusList.findIndex(
        (status) => status.id == statusId
      );
      if (foundIndex == -1) {
        const err = new Error("status not found");
        err.statusCode = 403;
        throw err;
      }
      foundUser.myStatusList[foundIndex].isSeen = isSeen;
    } else {
      const foundUserIndex = foundUser.othersStatusList.findIndex(
        (status) => status.userId == othersId
      );
      if (foundUserIndex == -1) {
        const err = new Error("User status not found");
        err.statusCode = 403;
        throw err;
      }
      foundIndex = foundUser.othersStatusList[
        foundUserIndex
      ].statusList.findIndex((status) => status.id == statusId);
      if (foundIndex == -1) {
        const err = new Error("status not found");
        err.statusCode = 403;
        throw err;
      }
      foundUser.othersStatusList[foundUserIndex].statusList[foundIndex].isSeen =
        isSeen;
    }
    const updatedUser = await foundUser.save();
    res.status(200).json({
      message: "data updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
