import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "./AuthContext";
import { axiosInstance } from "@/api/axiosInstance";
import { toast } from "sonner";

type ChatProviderProps = {
  children: ReactNode;
};

type CreateContextProps = {
  messages: any[];
  users: any[];
  selectedUser: any;
  getUsers: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  sendMessage: (messageData: any) => Promise<void>;
  setSelectedUser: React.Dispatch<any>;
  unseenMessages: Record<string, number>;
  setUnseenMessages: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  getMessages: (userId: string) => Promise<void>
};

export const ChatContext = createContext<CreateContextProps | null>(null);

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
    {}
  );
  const { socket } = useContext(AuthContext)!;

  // function to get all users for sidebar
  async function getUsers() {
    try {
      const { data } = await axiosInstance.get(`/messages/users`);
      if (data.success) {
        setUsers(data.user);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  // function to get messages for selected user
  async function getMessages(userId: string) {
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  // function to send message to selected user
  async function sendMessage(messageData: any) {
    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  // function to subscribe to messages for selected user
  async function subscribeToMessages() {
    if (!socket) return;

    socket.on("newMessage", (newMessage: any) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axiosInstance.put(`/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  }

  // function to unsubscribe from messages
  function unsubscribeFromMessages() {
    if (socket) socket.off("newMessage");
  }

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
