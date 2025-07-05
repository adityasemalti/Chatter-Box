import React, { useEffect, useState, useRef } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import { BsCheck2All, BsEmojiSmile } from "react-icons/bs";
import { userStore } from "../store/UserStore";
import { ChatStore } from "../store/ChatStore.js";
import avatar from "../assets/avatar.jpg";
import socket from "../socket.js";
import "../App.css";
import { Loader } from "lucide-react";

const ChatContainer = () => {
  const { authUser, selectedUser } = userStore();
  const { messages, getMessages, sendMessage, isMessagesLoading } = ChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // For preview
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (authUser?._id) {
      socket.emit("addUser", authUser._id);
    }
  }, [authUser]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      ChatStore.setState((state) => ({
        messages: [...state.messages, message],
      }));
    });

    return () => socket.off("receiveMessage");
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedImage) return;

    const messageData = {
      text: newMessage,
      image: selectedImage,
    };

    await sendMessage(messageData);

    socket.emit("sendMessage", {
      receiverId: selectedUser._id,
      message: {
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: newMessage,
        image: selectedImage,
        createdAt: new Date().toISOString(),
      },
    });

    setNewMessage("");
    setSelectedImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setSelectedImage(reader.result); // base64 preview
    };
  };

  if (!selectedUser) {
    return (
      <div className="w-full h-full bg-black rounded-lg text-white p-10 font-semibold text-xl ">
        Select user...
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-lg text-white p-6 flex flex-col scroll">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <img
          src={selectedUser?.profilePic || avatar}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h2 className="text-lg font-semibold">{selectedUser?.fullName}</h2>
          <p className="text-xs text-green-400">Online</p>
        </div>
        <div className="ml-auto flex gap-4 text-gray-400">
          <i className="ri-phone-line"></i>
          <i className="ri-video-line"></i>
          <i className="ri-more-2-fill"></i>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scroll mt-6">
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin w-6 h-6 text-white" />
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === authUser._id;
            return (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}
              >
                {!isSender && (
                  <img
                    src={selectedUser.profilePic || avatar}
                    className="w-8 h-8 rounded-full border object-cover"
                    alt="avatar"
                  />
                )}
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    isSender
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-white rounded-bl-none"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="mb-2 max-w-[200px] rounded-md"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
                {isSender && (
                  <img
                    src={authUser.profilePic || avatar}
                    className="w-8 h-8 rounded-full border object-cover"
                    alt="avatar"
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mt-2 flex items-center gap-4">
          <img
            src={selectedImage}
            alt="preview"
            className="w-24 h-24 rounded-md object-cover border"
          />
          <button
            onClick={() => setSelectedImage(null)}
            className="text-red-400 hover:text-red-600 text-sm"
          >
            Remove
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="mt-4 flex items-center gap-2 bg-[#2D2E3F] rounded-full px-4 py-2">
        <label htmlFor="attach" className="cursor-pointer">
          <FiPaperclip className="text-xl text-gray-400" />
        </label>
        <input
          type="file"
          id="attach"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type something..."
          className="flex-1 bg-transparent text-white outline-none placeholder:text-gray-400 px-2"
        />
        <BsEmojiSmile className="text-xl text-gray-400" />
        <button
          onClick={handleSend}
          className="bg-blue-600 p-2 rounded-full text-white"
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
