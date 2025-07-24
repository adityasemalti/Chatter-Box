import React, { useContext, useState ,useEffect} from "react";
import { Camera, Mail, User } from "lucide-react";
import avatar from '../assets/avatar.jpg';
import { AuthContext } from "../context/AuthContext";
import {useNavigate} from 'react-router-dom'

const ProfilePage = () => {
const navigate= useNavigate()
  const { updateProfile, authUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
const [bio, setBio] = useState("");

useEffect(() => {
  if (authUser) {
    setFullName(authUser.fullName || "");
    setBio(authUser.bio || "");
  }
}, [authUser]);

  const [image, setImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const [loading,setLoading] = useState(false)
  const handleUpdate = async (e) => {
    setLoading(true)
   e.preventDefault()
    try {
      if(!image)
      {
        await updateProfile({fullName:fullName,bio});
        navigate('/')
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload=async()=>{
      const base64Image = reader.result
    
    await updateProfile({profilePic:base64Image, fullName:fullName, bio})
    setLoading(false)
    navigate('/')
    }  
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="border-2 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={image ? URL.createObjectURL(image) : (authUser?.image || avatar)}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to update your photo
            </p>
          </div>

          {/* Editable Profile Info */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-200 rounded-lg border outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <input
                type="email"
                value={authUser?.email}
                readOnly
                className="w-full px-4 py-2.5 bg-base-200 rounded-lg border outline-none text-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                Bio
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-base-200 rounded-lg border outline-none"
                placeholder="Write something about yourself"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-all"
            >
              {
                loading? "Updating...":"Update info"
              }
            </button>
          </div>

          {/* Account Info */}
          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.substring(0, 10) || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
