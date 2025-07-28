import React, { useContext, useEffect, useState, useRef } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { BsCheck2All, BsEmojiSmile } from "react-icons/bs";
import avatar from "../assets/avatar.jpg";
import "../App.css";
import { ChatContext } from "../context/ChatContext";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const ChatContainer = () => {
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const lastMsgRef = useRef(null);


  const {
    // DMs
    messages,
    selectedUser,
    getMessages,
    sendMessage,
    // Rooms
    roomMessages,
    selectedRoom,
    getRoomMessages,
    sendRoomMessage,
  } = useContext(ChatContext);

  const {authUser} = useContext(AuthContext)
  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?._id;
  const currentUserPic = currentUser?.profilePic || avatar;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser && !selectedRoom) return;
      setMessagesLoading(true);
      try {
        if (selectedUser?._id) {
          await getMessages(selectedUser._id);
        } else if (selectedRoom?._id) {
          await getRoomMessages(selectedRoom._id);
        }
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser?._id, selectedRoom?._id]);


  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, roomMessages]);

  /* ---------------- Send message ---------------- */
  const handleSend = async () => {
    if (!newMessage.trim() && !imageBase64) return;
    if (!selectedUser && !selectedRoom) {
      toast.error("Select a user or room to send message");
      return;
    }

    setLoading(true);
    try {
      const payload = { text: newMessage, image: imageBase64 };
      if (selectedRoom?._id) {
        await sendRoomMessage(payload);
      } else if (selectedUser?._id) {
        await sendMessage(payload);
      }
      setNewMessage("");
      setImageBase64(null);
      setImagePreview(null);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (!selectedUser && !selectedRoom) {
    return (
      <div className="w-full h-full bg-black rounded-lg flex items-center justify-center text-white p-4">
        <p className="text-base md:text-lg font-semibold text-center">
          Select a user or room to start chatting...
        </p>
      </div>
    );
  }

  const chatMessages = selectedRoom ? roomMessages : messages;

  const chatHeaderName = selectedRoom
    ? selectedRoom.name
    : selectedUser?.fullName || "Unknown";

  const chatHeaderImage = selectedRoom ? null : selectedUser?.profilePic || avatar;

  
  const getSenderAvatar = (senderId) => {
    if (senderId === currentUserId) return currentUserPic;
    if (selectedRoom) return avatar; 
    return selectedUser?.profilePic || avatar;
  };

  return (
    <div className="w-full h-full bg-black rounded-lg text-white p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {chatHeaderImage ? (
          <img
            src={selectedUser?.profilePic || avatar}
            alt="Chat"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg">
            {chatHeaderName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-base md:text-lg font-semibold">{chatHeaderName}</h2>
          {selectedUser && <p className="text-xs text-green-400">Online</p>}
          {selectedRoom && (
            <p className="text-xs text-gray-400">
              {selectedRoom.members?.length || 0} members
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 md:pr-2 scroll mt-4">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-20">
            <Loader className="animate-spin text-gray-400 w-6 h-6" />
          </div>
        ) : (
          chatMessages.map((msg, i) => {
            const key = msg?._id || `msg-${i}`;
            const senderId = typeof msg?.senderId === "object" ? msg?.senderId?._id : msg?.senderId;
            const isSentByMe = senderId !== selectedUser?._id;
            const senderAvatar = getSenderAvatar(senderId);

            return (
              <div
                key={key}
                className={`flex items-end gap-2 ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar (left for received) */}
                {!isSentByMe && (
                  <img
                    src={selectedUser?.profilePic || avatar}
                    alt="sender"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[80%] sm:max-w-[60%] p-3 rounded-2xl break-words ${
                    isSentByMe ? "bg-blue-600" : "bg-neutral-700"
                  }`}
                >
                  {msg?.text && <p className="mb-1">{msg.text}</p>}
                  {msg?.image && (
                    <img
                      src={msg.image}
                      alt="attachment"
                      className="max-w-full rounded-md mt-1 max-h-60 sm:max-h-72 object-contain"
                    />
                  )}
                  <div className="text-right text-xs text-gray-300 mt-1 flex items-center justify-end gap-1">
                    {msg?.createdAt &&
                      new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    {isSentByMe && <BsCheck2All />}
                  </div>
                  {i === chatMessages.length - 1 && <div ref={lastMsgRef} />}
                </div>

                {/* Avatar (right for sent) */}
                {isSentByMe && (
                  <img
                    src={authUser?.profilePic || avatar}
                    alt="me"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="mt-2 mb-1 relative w-fit max-w-[80%] sm:max-w-xs">
          <img
            src={imagePreview}
            alt="preview"
            className="rounded-lg max-h-40 sm:max-h-60 border object-contain"
          />
          <button
            onClick={() => {
              setImagePreview(null);
              setImageBase64(null);
            }}
            className="absolute top-1 right-1 bg-black text-white rounded-full p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex items-center gap-2 bg-[#2D2E3F] rounded-full px-4 py-2 w-full">
        <label htmlFor="attach" className="cursor-pointer">
          <FiPaperclip className="text-xl text-gray-400" />
        </label>
        <input
          type="file"
          id="attach"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
  setNewMessage(e.target.value);
  emitTyping(selectedUser._id); // Send to receiver
}}
          placeholder="Type something..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-400 px-2 text-sm sm:text-base"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <BsEmojiSmile className="text-xl text-gray-400 cursor-pointer" />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 p-2 rounded-full text-white flex items-center justify-center w-10 h-10 disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin w-5 h-5" /> : <FiSend />}
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
