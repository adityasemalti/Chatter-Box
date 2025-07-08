import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null)
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext)

    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users", {
                headers: {
                    token: localStorage.getItem("token"), 
                },
            });

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
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData)
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    const subscribeToMessage = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`)
            } else {
                setUnseenMessages((prev) => ({
                    ...prev, [newMessage.senderId]:
                        prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }


    const unSubscribeToMessage = async () => {
        if (socket) socket.off("newMessage");
    }

    useEffect(() => {
        subscribeToMessage();
        return () => unSubscribeToMessage()
    }, [socket, selectedUser])


    const value = {
        messages, users, selectedUser, getUsers, setMessages,getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}