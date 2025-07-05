import React, { useEffect } from "react";
import '../App.css';
import { userStore } from "../store/UserStore.js";
import avatar from '../assets/avatar.jpg';
import { useNavigate } from "react-router-dom";
import { Loader, LogOut } from "lucide-react";
import {toast} from 'react-hot-toast'

const Sidebar = () => {
  const navigate = useNavigate();
  const { otherUsers, getOtherUsers, authUser, setSelectedUser, loading, logout,checkAuth } = userStore();

  useEffect(() => {
    getOtherUsers();
  }, [getOtherUsers]);

  const handleLogout = () => {
    logout();
    toast.success("Logged Out") 
    navigate("/login");
  };
  useEffect(()=>{
    checkAuth()
  },[ checkAuth])

  if (loading)
    return (
      <div className="w-full h-full bg-black text-white rounded-lg text-center font-semibold text-lg p-10">
        <Loader />
      </div>
    );

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto p-4 space-y-2 scroll rounded-lg">
      {/* Header with Profile & Logout */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-white cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <img
              src={authUser?.user?.profilePic || avatar}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">
              {authUser?.user?.fullName}
            </p>
            <p className="text-sm text-gray-400">
              {authUser?.user?.email || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-neutral-800 rounded-full"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Other Users */}
      {otherUsers?.map((chat, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 cursor-pointer "
          onClick={() => setSelectedUser(chat)}
        >
          {chat?.profilePic ? (
            <img
              src={chat.profilePic}
              alt={chat.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold text-sm">
              {chat.fullName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{chat.fullName}</p>
            <p className="text-xs text-gray-400 truncate w-52">{chat.msg || ""}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
