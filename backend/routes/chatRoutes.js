const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.patch("/group/add", protect, addToGroup);
router.patch("/group/remove", protect, removeFromGroup);
router.patch("/rename", protect, renameGroupChat);

module.exports = router;
