import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import avatar from "../assets/avatar.jpg";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {
  const { logout, authUser, onlineUsers } = useContext(AuthContext);
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    createRoom,
    rooms,
    getAllRooms,
    selectedRoom,
    setSelectedRoom,
    deleteRoomById,
    getMyRooms,
    myRooms
  } = useContext(ChatContext);
  console.log(myRooms)
  useEffect(()=>{
    getMyRooms()
  },[])

  const [usersLoading, setUsersLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [view, setView] = useState("users");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      await getUsers();
      setUsersLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    getAllRooms();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    await createRoom(roomName, selectedMembers);
    setRoomName("");
    setSelectedMembers([]);
    setShowRoomForm(false);
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.some((user) => user.userId === userId);
  };

  const getUserById = (id) => users.find((u) => u._id === id);

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      await deleteRoomById(roomId);
      // Optionally, clear selectedRoom if it was the deleted one
      if (selectedRoom?._id === roomId) {
        setSelectedRoom(null);
      }
      // Refresh rooms list
      getAllRooms();
    }
  };

  return (
    <div className="w-full h-full bg-black text-white overflow-y-auto p-4 space-y-2 scroll rounded-lg relative">
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

      {/* View toggle buttons */}
      <div className="flex justify-between mb-4">
        <button
          className={`flex-grow py-1 font-semibold rounded-l-md ${
            view === "users"
              ? "bg-blue-700"
              : "bg-neutral-900 hover:bg-neutral-800"
          }`}
          onClick={() => setView("users")}
        >
          Users
        </button>
        <button
          className={`flex-grow py-1 font-semibold rounded-r-md ${
            view === "rooms"
              ? "bg-blue-700"
              : "bg-neutral-900 hover:bg-neutral-800"
          }`}
          onClick={() => setView("rooms")}
        >
          Rooms
        </button>
      </div>

      {/* Content based on view */}
      {view === "users" && (
        <>
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
                    setSelectedRoom(null); // clear room selection
                    setUnseenMessages((prev) => ({
                      ...prev,
                      [chat._id]: 0,
                    }));
                  }}
                >
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
                      <p className="font-semibold text-sm truncate">
                        {chat.fullName}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[12rem] sm:max-w-[14rem] md:max-w-[16rem]">
                        {chat.msg || "Start a conversation"}
                      </p>
                    </div>
                  </div>

                  {unseenCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {unseenCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {view === "rooms" && (
        <>
          {/* Create Room Button */}
          <p
            className="w-full text-right py-2 text-blue-400 hover:underline cursor-pointer"
            onClick={() => setShowRoomForm(true)}
          >
            + Create Room
          </p>

          {/* Rooms List */}
          {rooms.length === 0 ? (
            <p className="text-center text-gray-400 mt-4">No rooms available</p>
          ) : (
            rooms.map((room) => {
              const isSelected = selectedRoom?._id === room._id;
              return (
                <div
                  key={room._id}
                  className={` p-2 rounded-xl cursor-pointer mb-2 ${
                    isSelected
                      ? "bg-blue-700"
                      : "bg-neutral-900 hover:bg-neutral-800"
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedRoom(room);
                      setSelectedUser(null);
                    }}
                    className="cursor-pointer"
                  >
                    <p className="font-semibold">{room.name}</p>
                    <p className="text-xs text-gray-400">
                      Members: {room.members.length}
                    </p>
                  </div>

                  {/* Delete Room Button */}
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="mt-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded "
                    title="Delete Room"
                  >
                    Delete
                  </button>

                  {/* Show members if this room is selected */}
                  {isSelected && (
                    <div className="mt-2 max-h-36 overflow-y-auto border-t border-gray-700 pt-2">
                      {room.members.length === 0 ? (
                        <p className="text-gray-400 text-sm">No members</p>
                      ) : (
                        room.members.map((memberId) => {
                          const member = getUserById(memberId);
                          if (!member) return null;
                          const online = isUserOnline(member._id);
                          return (
                            <div
                              key={member._id}
                              className="flex items-center gap-2 mb-1"
                            >
                              {member.profilePic ? (
                                <img
                                  src={member.profilePic}
                                  alt={member.fullName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-yellow-300 text-black flex items-center justify-center font-bold text-xs">
                                  {member.fullName
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                              <span className="text-sm">{member.fullName}</span>
                              {online && (
                                <span className="w-2 h-2 bg-green-500 rounded-full border border-black"></span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* Create Room Form Modal */}
      {showRoomForm && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <form
            onSubmit={handleCreateRoom}
            className="bg-neutral-900 p-6 rounded-xl w-full max-w-md space-y-4 border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-center text-white">
              Create New Room
            </h2>

            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-neutral-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <div className="max-h-40 overflow-y-auto space-y-2 text-sm">
              {users
                .filter((u) => u._id !== authUser?._id)
                .map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                      className="accent-blue-500"
                    />
                    {user.fullName}
                  </label>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRoomForm(false)}
                className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
