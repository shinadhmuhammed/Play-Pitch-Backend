import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./FrameWorks/Routes/userRoutes";
import OwnerRouter from "./FrameWorks/Routes/ownerRoutes";
import AdminRouter from "./FrameWorks/Routes/adminRoutes";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: "localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", userRouter);
app.use("/owner", OwnerRouter);
app.use("/admin", AdminRouter);

mongoose.connect("mongodb://127.0.0.1:27017/PlayPitch");

const db = mongoose.connection;

db.once("connected", () => {
  console.log("MongoDB connected successfully");

  app.listen(3001, () => {
    console.log("Server started on port 3001");
  });
});
