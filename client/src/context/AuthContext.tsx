import { axiosInstance } from "@/api/axiosInstance";
import { createContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import type { User } from "@/types/user";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextType = {
  authUser: User | null;
  onlineUsers: any[];
  socket: any;
  loading: Boolean;
  checkAuth: () => Promise<void>;
  login: (state: string, credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: any) => Promise<void>;
  isDataSubmitted: boolean;
  setIsDataSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
};

type Credentials = {
  fullName: string;
  email: string;
  password: string;
  bio: string;
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<any>(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  // Check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false); // done checking
    }
  };

  // Connect socket function to handle socket connection and online users updates
  function connectSocket(userData: User) {
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
  }

  // Login function to handle user authentication and socket connection
  async function login(state: string, credentials: Credentials) {
    try {
      const { data } = await axiosInstance.post(`/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axiosInstance.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setIsDataSubmitted(false)
    }
  }

  // Logout function to handle user logout and socket disconnection
  async function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axiosInstance.defaults.headers.common["token"] = null;
    toast.success("Logout successfully");
    socket.disconnect();
  }

  // Update profile function to handle user profile updates
  async function updateProfile(body: any) {
    try {
      const { data } = await axiosInstance.put(`/auth/update-profile`, body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common["token"] = token;
      checkAuth();
    } else {
      setLoading(false); // no token = not logged in
    }
  }, []);

  const value = {
    authUser,
    onlineUsers,
    socket,
    checkAuth,
    login,
    logout,
    updateProfile,
    loading,
    isDataSubmitted,
    setIsDataSubmitted,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
