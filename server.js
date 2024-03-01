const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", //---front-end---url
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const messageHistory = {};

io.on("connection", (socket) => {
  socket.on("join_room", (roomId, username) => {
    socket.join(roomId);
    const roomHistory = messageHistory[roomId] || [];
    const lastMessages = roomHistory.slice(-10);
    socket.emit("initial_message_history", lastMessages);
    // socket.to(roomId).emit("join_notification", username);
    socket.to(roomId).emit("join_notification", { username, key: "join" });

  });

  socket.on("leave_room", ({ username, roomId }) => {
    // console.log("A user disconnected:", username, socket.id);
    // socket.to(roomId).emit("leave_notification", username);
    socket.to(roomId).emit("leave_notification", { username, key: "leave" });

  });

  socket.on("send_msg", (data) => {
    // console.log(data, "DATA");
    if (!messageHistory[data.roomId]) {
      messageHistory[data.roomId] = [];
    }
    messageHistory[data.roomId].push(data);
    messageHistory[data.roomId] = messageHistory[data.roomId].slice(-10);
    socket.to(data.roomId).emit("receive_msg", data);
  });

  socket.on("typing", (data) => {
    // console.log(`${data.username} is typing: ${data.isTyping}`);
    socket
      .to(data.roomId)
      .emit("user_typing", { user: data.username, isTyping: data.isTyping });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
