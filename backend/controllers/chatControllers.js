const asyncHandler = require("express-async-handler");
const { Chat } = require("../models/chatModel");
const { User } = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param not sent");
    return res.status(400).json({
      message: "userId param not sent",
    });
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.status(200).json(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await new Chat(chatData).save();

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).json(fullChat);
    } catch (error) {
      console.log(error);
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const sortedChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const chats = await User.populate(sortedChats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    return res.status(400).json({
      message: "Please fill all required fields",
    });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).json({
      message: "More than 2 users are required to form a group chat",
    });
  }

  users.push(req.user);

  try {
    const newGroupChat = await new Chat({
      chatName: req.body.name,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    }).save();

    const groupChat = await Chat.findOne({ _id: newGroupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(groupChat);
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({
      message: "Please fill all required fields",
    });
  }

  try {
    const chat = await Chat.findById({ _id: chatId });
    if (chat.isGroupChat === false) {
      res.status(400);
      throw new Error("Cannot rename single chat");
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(400);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById({ _id: chatId });
    if (chat.isGroupChat === false) {
      res.status(400);
      throw new Error("Cannot add users to single chat");
    }

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(400);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(added);
    }
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await Chat.findById({ _id: chatId });
    if (!chat) {
      res.status(400);
      throw new Error("Chat Not Found");
    }

    if (!chat.isGroupChat) {
      res.status(400);
      throw new Error("Cannot remove users from single chat");
    }

    if (chat.groupAdmin.toString() === userId) {
      // The user to be removed is the group admin
      const remainingUsers = chat.users.filter(
        (user) => user.toString() !== userId
      );
      if (remainingUsers.length === 0) {
        // Admin is the last user, delete the group
        await Chat.findByIdAndDelete(chatId);
        res
          .status(200)
          .json({ message: "Group deleted as the last user (admin) left" });
        return;
      }

      const newAdmin = remainingUsers[0]; // Select the first user as the new admin
      chat.groupAdmin = newAdmin;
    }

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
        groupAdmin: chat.groupAdmin,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(400);
      throw new Error("Chat Not Found");
    } else {
      res.status(200).json(removed);
    }
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  addToGroup,
  removeFromGroup,
  renameGroupChat,
};
