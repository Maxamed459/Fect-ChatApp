// Get all users except the logged in user
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import { io, userSocketMap } from "../server.js";
import User from "../models/User.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filterUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Count numbers of messages not seen
    const unseenMessages = {};
    const Promises = filterUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        reciverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promises.all(Promises);
    res.json({ success: true, users: filterUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selcted users
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

    const reciverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = Message.create({
      senderId,
      reciverId,
      text,
      image: imageUrl,
    });

    // Emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[reciverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {}
};
