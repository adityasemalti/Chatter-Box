import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDb from './db/connectDB.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import http from 'http';
import roomRouter from './routes/roomRoutes.js';



dotenv.config();

const app = express();
const server = http.createServer(app)

export const io = new Server(server,{
  cors:{origin:"*"}
})

export const userSocketMap = {} //{ userId:socketId}

//socket.io connection
io.on("connection",(socket)=>{
   const userId = socket.handshake.query.userId;
   console.log("user connected ",userId)
   if(userId)
   {
    userSocketMap[userId]=socket.id;

    //emit online users to all connnected 
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    socket.on("disconnect",()=>{
      console.log("user disconnected", userId)
      delete userSocketMap[userId];
      io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
   }

})

app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(cookieParser());

app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/rooms',roomRouter)

app.get('/', (req, res) => {
  res.send("Running Backend");
});

connectDb();
if(process.env.NODE_ENV !== 'production'){
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
}
export default server