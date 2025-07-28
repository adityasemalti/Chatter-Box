import Room from '../models/roomModel.js';
import Message from '../models/messageModel.js';
import cloudinary from '../cloudinary.js';
import { io } from '../index.js';

export const createRoom = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const myId = req.user

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: "Room name is required and must be a string." });
    }

    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ success: false, message: "Room already exists" });
    }

    const allMembers = [...members, myId._id.toString()];
    const uniqueMembers = [...new Set(allMembers)];

    const newRoom = await Room.create({
      name,
      members: uniqueMembers,
    });

    res.status(201).json({ success: true, message: "Room created", room: newRoom });
  } catch (error) {
    console.error("Error in createRoom:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("members", "username email");
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error("Error in getAllRooms:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyRooms =async(req,res)=>{
  try {
    const loggedInUser = req.user;
    const myRooms = await Room.find( { members: { $in: [loggedInUser._id] } } ).populate("members", "username email");
    res.status(200).json({ success: true, rooms: myRooms });
  } catch (error) {
    res.json({success:false, message:error.message})
  }
}

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.status(200).json({ success: true, message: "Joined room", room });
  } catch (error) {
    console.error("Error in joinRoom:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId })
      .populate("senderId", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error in getRoomMessages:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



export const sendRoomMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    let imageUrl = '';
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const message = await Message.create({
      senderId,
      roomId,
      text,
      image: imageUrl
    });

    io.to(roomId).emit("newRoomMessage", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error in sendRoomMessage:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};