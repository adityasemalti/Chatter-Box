import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http'; // 👈 for creating HTTP server
import { Server } from 'socket.io'; // 👈 Socket.IO
import connectDb from './db/connectDB.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Online users map
const userSocketMap = {}; // { userId: socketId }
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("📡 New client connected:", socket.id);

  socket.on("addUser", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log("✅ User online:", userId);
  });

  socket.on("sendMessage", ({ receiverId, message }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

// Middleware & routes
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);

app.get('/', (req, res) => {
  res.send("Running Backend");
});

// DB & Server start
connectDb();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
