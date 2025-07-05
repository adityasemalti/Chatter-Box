import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../axios/axios.js";
import { userStore } from "./UserStore.js"; 

export const ChatStore = create((set, get) => ({
  messages: [],
  users: [],
  isUsersLoading: false,
  isMessagesLoading: false,

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await api.get(`/api/message/${userId}`);
      set({ messages: res.data });
    
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { messages } = get();
    const { selectedUser } = userStore.getState();

    if (!selectedUser) {
      toast.error("No user selected to send message");
      return;
    }

    try {
      const res = await api.post(`/api/message/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },
}));
