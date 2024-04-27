import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoURI: string = process.env.MONGODB_URI || "";

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.once("open", () => {
  console.log("MongoDB connected successfully");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export default db;
