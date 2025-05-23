import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middlware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    // const token = req.headers.token;

    /** 1. READ the header exactly as sent **/
    const authHeader = req.headers.authorization; // should be: 'Bearer <jwt>'
    const token = authHeader && authHeader.split(" ")[1]; // token is undefined if header missing

    /** 2. FAIL EARLY if token missing **/
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
