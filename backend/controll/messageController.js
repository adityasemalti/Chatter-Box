import cloudinary from '../cloudinary.js'
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import { io,userSocketMap } from '../index.js';

export const getOtherUsers = async (req, res) => {
  const loggedInUserId = req.user._id;
  try {
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    const unseenMessages = {}
    const promises = filteredUsers.map(async(user)=>{
      const messages= await Message.find({senderId:user._id, receiverId:loggedInUserId,seen:false})
      if(messages.length > 0)
      {
        unseenMessages[user._id]= messages.length;
      }
    })
    await Promise.all(promises)
    res.json({success:true,filteredUsers,unseenMessages});
  } catch (error) {
    console.log("Error in getOtherUsers function", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const createdMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    });

    const newMessage = await Message.findById(createdMessage._id)
      .populate("senderId", "username profilePic")
      .populate("receiverId", "username profilePic");

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    await Message.updateMany({senderId:userToChatId, receiverId:myId}, {seen:true})
    res.json({success:true, messages})
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const markMessageAsSeen = async (req,res)=>{
  try {
    const {id} = req.params;
    await Message.findByIdAndUpdate(id,{seen:true});
    res.json({success:true})
  } catch (error) {
    console.log(error.message)
    res.json({success:false, message:error.message})
  }
}