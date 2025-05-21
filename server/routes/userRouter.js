import express from "express";
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import multer from "multer";

const userRouter = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.put("/update-profile", protectRoute, upload.single("profilePic"), updateProfile);

export default userRouter;
