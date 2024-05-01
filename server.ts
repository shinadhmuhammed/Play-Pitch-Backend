
import express from "express";
import cors from "cors";
import userRouter from "./FrameWorks/Routes/userRoutes";
import OwnerRouter from "./FrameWorks/Routes/ownerRoutes";
import AdminRouter from "./FrameWorks/Routes/adminRoutes";
import cookieParser from "cookie-parser";
import db from "./FrameWorks/Database/dbconnect";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import configureSocket from "./Business/utils/socket";


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173/"
  }
});

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "*"
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads',express.static('uploads'))

app.use("/", userRouter);
app.use("/owner", OwnerRouter);
app.use("/admin", AdminRouter);

configureSocket(io); 

db.once("open", () => {
  server.listen(3001, () => {
    console.log("Server started on port 3001");
  });
});
