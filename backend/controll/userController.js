import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../cloudinary.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({success:false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic: "", 
    });

    const token = generateToken(user._id);
    res.status(201).json({success:true, message: "User registered", userData:user,token });
  } catch (error) {
    res.status(500).json({success:false, message: "Server error", error: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({success:false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({success:false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({success:true ,message: "Login successful",userdata:user,token });
  } catch (error) {
    res.status(500).json({success:false, message: "Server error", error: error.message });
  }
};



export const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, profilePic,bio } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    let updatedUser;
    if(!profilePic)
    {
      updatedUser =await User.findByIdAndUpdate(userId, {bio,fullName},{new:true})
    }else{
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser= await User.findByIdAndUpdate(userId, {profilePic:upload.secure_url, bio,fullName},{new:true})
    }


    res.status(200).json({success:true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in UpdateProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({success:true, user: req.user });
  } catch (error) {
    res.status(500).json({success:false, message: "Failed to fetch user", error: error.message });
  }
};