import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client'

export const AuthContext = createContext()
const backendUrl = import.meta.env.VITE_BACKEND;
axios.defaults.baseURL = backendUrl

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)


    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {

            console.log(error)
        }
    }

    const login = async (credentials) => {
        try {
            const { data } = await axios.post("/api/auth/login", credentials)
            if (data.success) {
                setAuthUser(data.userdata)
                connectSocket(data.userdata)
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token)
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const signup = async (userData) => {
        try {
            const { data } = await axios.post("/api/auth/signup", userData);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };


    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged Out successfully !");
        socket.disconnect();
    }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body)
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile Updated Successfully !!");
            }
        } catch (error) {
            toast.error(error.message)
        }

    }

    //connect socket 
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token
        }
        checkAuth()
    }, [])
    useEffect(() => {
  if (socket) {
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });
  }
}, [socket]);


    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        signup,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}