const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
  room: String, // 🔥 추가
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);