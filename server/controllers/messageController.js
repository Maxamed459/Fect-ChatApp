// Get all users except the logged in user
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import { io, userSocketMap } from "../server.js";
import User from "../models/User.js";

// export const getUsersForSidebar = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const filterUsers = await User.find({ _id: { $ne: userId } }).select(
//       "-password"
//     );

//     // Count numbers of messages not seen
//     const unseenMessages = {};
//     const Promises = filterUsers.map(async (user) => {
//       const messages = await Message.find({
//         senderId: user._id,
//         reciverId: userId,
//         seen: false,
//       });
//       if (messages.length > 0) {
//         unseenMessages[user._id] = messages.length;
//       }
//     });
//     await Promise.all(Promises);
//     res.json({ success: true, users: filterUsers, unseenMessages });
//   } catch (error) {
//     console.log(error.message);
//     res.json({ success: false, message: error.message });
//   }
// };

// Get all messages for selcted users

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filterUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    const unseenMessages = {};
    const userWithLastMessage = [];

    const promises = filterUsers.map(async (user) => {
      // Count unseen messages
      const unseen = await Message.countDocuments({
        senderId: user._id,
        reciverId: userId,
        seen: false,
      });
      if (unseen > 0) {
        unseenMessages[user._id] = unseen;
      }

      // Find the last message between the two users (sent or received)
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: userId, reciverId: user._id },
          { senderId: user._id, reciverId: userId },
        ],
      }).sort({ createdAt: -1 });

      userWithLastMessage.push({
        ...user.toObject(),
        lastMessageAt: lastMessage ? lastMessage.createdAt : new Date(0), // fallback to epoch if no messages
      });
    });

    await Promise.all(promises);

    // Sort by lastMessageAt (most recent first)
    userWithLastMessage.sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.json({ success: true, users: userWithLastMessage, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          reciverId: selectedUserId,
        },
        {
          senderId: selectedUserId,
          reciverId: myId,
        },
      ],
    });
    await Message.updateMany(
      { senderId: selectedUserId, reciverId: myId },
      { seen: true }
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// api to mark messages as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = await Message.create({
      senderId,
      reciverId: receiverId,
      text,
      image: imageUrl,
    });

    // Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
