import React, { useContext, useEffect,useState } from "react";
import "../App.css";
import avatar from "../assets/avatar.jpg";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Loader } from "lucide-react";

const Sidebar = () => {
  const { logout, authUser, onlineUsers } = useContext(AuthContext);
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const [usersLoading, setUsersLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true); // 👈
      await getUsers();
      setUsersLoading(false); // 👈
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.some((user) => user.userId === userId);
  };

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto p-4 space-y-2 scroll rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-14 h-14 rounded-full border-2 border-white cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <img
              src={authUser?.profilePic || avatar}
              alt="profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-base truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-gray-400 truncate">{authUser?.email}</p>
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

      {/* Users Loader */}
      {usersLoading ? (
        <div className="flex justify-center items-center h-20">
          <Loader className="animate-spin text-gray-400 w-6 h-6" />
        </div>
      ) : (
        users.map((chat) => {
          const unseenCount = unseenMessages[chat._id] || 0;
          const isSelected = selectedUser?._id === chat._id;
          const online = isUserOnline(chat._id);

          return (
            <div
              key={chat._id}
              className={`flex items-center justify-between gap-3 p-2 rounded-xl cursor-pointer transition ${
                isSelected
                  ? "bg-blue-700"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
              onClick={() => {
                setSelectedUser(chat);
                setUnseenMessages((prev) => ({
                  ...prev,
                  [chat._id]: 0,
                }));
              }}
            >
              {/* Avatar and Info */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="relative">
                  {chat.profilePic ? (
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
                  {online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{chat.fullName}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[12rem] sm:max-w-[14rem] md:max-w-[16rem]">
                    {chat.msg || "Start a conversation"}
                  </p>
                </div>
              </div>

              {/* Unseen badge */}
              {unseenCount > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {unseenCount}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Sidebar;
