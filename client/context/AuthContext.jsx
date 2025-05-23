import axios from "axios";
import { createContext, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  /// Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        // Update to use Authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        localStorage.setItem("token", data.token);
        setToken(data.token);

        setAuthUser(data.userData);
        connectSocket(data.userData);

        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setAuthLoading(false); // ✅ important
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
    if (socket) socket.disconnect();
  };

  // update profile function to handle user profile updates

  const updateProfile = async (body) => {
    try {
      const formData = new FormData();

      // Add text fields
      formData.append("fullName", body.fullName);
      formData.append("bio", body.bio);

      // Add image if present
      if (body.profilePic) {
        // Convert base64 to blob
        const response = await fetch(body.profilePic);
        const blob = await response.blob();
        formData.append("profilePic", blob, "profile.jpg");
      }

      const { data } = await axios.put("/api/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // connect socket function to handle socket connection and online user updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    authLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
