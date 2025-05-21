import mongoose from "mongoose";

//Function to connect to the database
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};
