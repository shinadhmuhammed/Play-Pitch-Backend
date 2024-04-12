import express from "express";
import cors from "cors";
import userRouter from "./FrameWorks/Routes/userRoutes";
import OwnerRouter from "./FrameWorks/Routes/ownerRoutes";
import AdminRouter from "./FrameWorks/Routes/adminRoutes";
import cookieParser from "cookie-parser";
import db from "./FrameWorks/Database/dbconnect";

const app = express();

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads',express.static('uploads'))

app.use("/", userRouter);
app.use("/owner", OwnerRouter);
app.use("/admin", AdminRouter);


db.once("open", () => {
  app.listen(3001, () => {
    console.log("Server started on port 3001");
  });
});
