import express from "express";
const userRouter = express.Router();
import UserController from "../../Adapters/Controllers/UserController";
import jwtUser from "../Middlewares/jwt/jwtUser";
import { Multer } from "multer";
import upload from "../Middlewares/multer";
const multerUpload: Multer = upload;



userRouter.post("/signup", UserController.signup);
userRouter.post("/verify-otp", UserController.verifyOtp);
userRouter.post("/resendotp", UserController.resendOtp);
userRouter.post("/login", UserController.login);
userRouter.post("/forgotpassword", UserController.forgotPassword);
userRouter.post("/sendotp", UserController.sendOtp);
userRouter.post("/verify-forgot", UserController.verifyForgot);
userRouter.post("/google-login", UserController.googleAuth);
userRouter.get("/getturf",jwtUser.verifyJwtUser, UserController.getTurf);
userRouter.get('/getTurf/:id',jwtUser.verifyJwtUser,UserController.getSingleTurf)
userRouter.get('/getbooking',jwtUser.verifyJwtUser,UserController.getBooking)
userRouter.get('/getbooking/:bookingId',jwtUser.verifyJwtUser,UserController.getBookingById)
userRouter.post('/slotavailability',jwtUser.verifyJwtUser,UserController.checkSlotAvailibility)
userRouter.post('/stripepayment',jwtUser.verifyJwtUser,UserController.stripePayment)
userRouter.post('/paywithwallet',jwtUser.verifyJwtUser,UserController.payWithWallet)
userRouter.post('/create-booking',jwtUser.verifyJwtUser,UserController.stripeBooking)
userRouter.get("/userdetails",jwtUser.verifyJwtUser, UserController.getDetails);
userRouter.post("/reset-password",jwtUser.verifyJwtUser, UserController.resetPassword);
userRouter.post("/userDetailsEdit", multerUpload.single("profilePhoto"), jwtUser.verifyJwtUser, UserController.editUserDetails);
userRouter.post("/cancelbooking",jwtUser.verifyJwtUser,UserController.cancelBooking)





export default userRouter;
