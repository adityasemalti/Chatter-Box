import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios,token } = useContext(AuthContext);

  // ===== User-related =====
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.filteredUsers);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
  try {
    const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
    if (data.success) {
      setMessages((prev) => [...prev, data.message]); 
    }
  } catch (error) {
    toast.error(error.message);
  }
};



  // ===== Room-related =====
  const getAllRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/all");
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      const { data } = await axios.post(`/api/rooms/join/${roomId}`);
      if (data.success) {
        setSelectedUser(null);
        setSelectedRoom(data.room);
        socket.emit("join-room", roomId);
        getRoomMessages(roomId);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getRoomMessages = async (roomId) => {
    try {
      const { data } = await axios.get(`/api/rooms/${roomId}/messages`);
      if (data.success) {
        setRoomMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendRoomMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/rooms/${selectedRoom._id}/messages`, messageData);
      if (data.success) {
        setRoomMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ===== Socket Listeners =====
  const subscribeToSocketEvents = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1,
        }));
      }
    });

    socket.on("newRoomMessage", (newMessage) => {
      if (selectedRoom && newMessage.roomId === selectedRoom._id) {
        setRoomMessages((prev) => [...prev, newMessage]);
      }
    });
  };

  const unsubscribeFromSocketEvents = () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("newRoomMessage");
    }
  };

  const createRoom = async (roomName, members) => {
    try {
      const { data } = await axios.post("/api/rooms/create", {
        name: roomName,
        members,
      });
      if (data.success) {
        toast.success("Room created successfully");
        setRooms((prev) => [...prev, data.room]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create room");
    }
  };
  const deleteRoomById = async (roomId) => {
  try {
    const response = await axios.delete(`/api/rooms/${roomId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
    });

   

    setRooms((prevRooms) => prevRooms.filter((room) => room._id !== roomId));

    return true;
  } catch (error) {
    console.error("Delete room error:", error.response?.data || error.message);
    return false;
  }
};



  useEffect(() => {
    subscribeToSocketEvents();
    return () => unsubscribeFromSocketEvents();
  }, [socket, selectedUser, selectedRoom]);

  const value = {
    // DMs
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,

    // Rooms
    rooms,
    selectedRoom,
    getAllRooms,
    joinRoom,
    getRoomMessages,
    sendRoomMessage,
    roomMessages,
    setSelectedRoom,
    createRoom,
    deleteRoomById
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
