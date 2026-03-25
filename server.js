const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Message = require("./models/Message");
const User = require("./models/User");

const SECRET = "mysecretkey";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 🔥 MongoDB 연결
mongoose.connect("mongodb://dunk124489_db_user:abc45617@ac-9dgzg5d-shard-00-00.gkkhogn.mongodb.net:27017,ac-9dgzg5d-shard-00-01.gkkhogn.mongodb.net:27017,ac-9dgzg5d-shard-00-02.gkkhogn.mongodb.net:27017/?ssl=true&replicaSet=atlas-a4g13u-shard-0&authSource=admin&appName=Cluster0");
mongoose.connection.on("connected", () => {
  console.log("✅ DB 연결됨");
});
mongoose.connection.on("error", (err) => {
  console.log("❌ DB 에러:", err);
});

// ================== API ==================

// 🔥 방별 메시지 조회
app.get("/messages/:room", async (req, res) => {
  const room = req.params.room;

  const messages = await Message.find({ room }).sort({ createdAt: 1 });

  res.json(messages);
});

// 🔥 회원가입
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const newUser = new User({ username, password });
  await newUser.save();

  res.json({ message: "회원가입 완료" });
});

// 🔥 로그인 (JWT 발급)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });

  if (user) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } else {
    res.json({ success: false });
  }
});

// ================== SOCKET ==================

io.on("connection", (socket) => {
  console.log("접속됨:", socket.id);

  // 🔥 방 입장
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log("방 입장:", room);
  });

  // 🔥 JWT 기반 채팅
  socket.on("sendMessage", async (data) => {
    try {
      const decoded = jwt.verify(data.token, SECRET);

      const newMessage = new Message({
        text: data.text,
        user: decoded.username,
        room: data.room
      });

      await newMessage.save();

      io.to(data.room).emit("receiveMessage", {
        text: data.text,
        user: decoded.username,
        room: data.room
      });

    } catch (err) {
      console.log("❌ 토큰 오류");
    }
  });

  socket.on("disconnect", () => {
    console.log("유저 나감");
  });
});

// ================== SERVER ==================

server.listen(3000, () => {
  console.log("🚀 서버 실행중 http://localhost:3000");
});