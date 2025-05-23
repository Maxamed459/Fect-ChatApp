import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { authUser } = useContext(AuthContext);

  const { socket, axios } = useContext(AuthContext);

  // function to get all users from sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      //   console.log("Fetched users:", data); // ✅ Add this
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get messages for selected users
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to send message to selected user
  // const sendMessage = async (messageData) => {
  //   // try {
  //   //   const { data } = await axios.post(
  //   //     `/api/messages/send/${selectedUser._id}`,
  //   //     messageData
  //   //   );
  //   //   if (data.success) {
  //   //     setMessages((prevMessages) => [...prevMessages, data.newMessage]);
  //   //   } else {
  //   //     toast.error(data.message);
  //   //   }
  //   // } catch (error) {
  //   //   toast.error(error.message);
  //   // }
  //   try {
  //     const tempId = `${Date.now()}`;
  //     const tempMessage = {
  //       text: messageData.text || null,
  //       image: messageData.image || null,
  //       senderId: authUser._id,
  //       receiverId: selectedUser._id,
  //       createdAt: new Date().toISOString(),
  //       _id: tempId,
  //       pending: true,
  //     };

  //     // 👁 Optimistically show message
  //     setMessages((prev) => [...prev, tempMessage]);

  //     // Send to server
  //     const { data } = await axios.post(
  //       `/api/messages/send/${selectedUser._id}`,
  //       messageData
  //     );

  //     if (data.success) {
  //       // Replace temporary message with real one
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg._id === tempId
  //             ? { ...data.newMessage, senderId: authUser._id }
  //             : msg
  //         )
  //       );
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  const sendMessage = async (messageData) => {
    if (!messageData?.text?.trim() && !messageData?.image) {
      toast.error("Cannot send an empty message.");
      return;
    }

    try {
      const tempId = `${Date.now()}`;
      const tempMessage = {
        text: messageData.text || null,
        image: messageData.image || null,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        createdAt: new Date().toISOString(),
        _id: tempId,
        pending: true,
      };

      // Optimistically update UI
      setMessages((prev) => [...prev, tempMessage]);

      // Send to server
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...data.newMessage, senderId: authUser._id }
              : msg
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user

  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevunseenMessages) => ({
          ...prevunseenMessages,
          [newMessage.senderId]: prevunseenMessages[newMessage.senderId]
            ? prevunseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // function to unsubscribe from messages
  const unsubscribeToMessages = async () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeToMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
