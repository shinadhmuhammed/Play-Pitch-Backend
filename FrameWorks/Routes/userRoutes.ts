import express from "express";
const userRouter = express.Router();
import UserController from "../../Adapters/Controllers/UserController";
import jwtUser from "../Middlewares/jwt/jwtUser";



userRouter.post("/signup", UserController.signup);
userRouter.post("/verify-otp", UserController.verifyOtp);
userRouter.post("/resendotp", UserController.resendOtp);
userRouter.post("/login", UserController.login);
userRouter.post("/forgotpassword", UserController.forgotPassword);
userRouter.post("/sendotp", UserController.sendOtp);
userRouter.post("/verify-forgot", UserController.verifyForgot);
userRouter.post("/google-login", UserController.googleAuth);
userRouter.get("/getturf", jwtUser.verifyJwtUser, UserController.getTurf);



export default userRouter;
