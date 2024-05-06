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
userRouter.post('/turfrating',jwtUser.verifyJwtUser,UserController.getTurfRating)
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
userRouter.post("/createactivity",jwtUser.verifyJwtUser,UserController.createActivity)
userRouter.get("/getactivity",jwtUser.verifyJwtUser,UserController.getActivity)
userRouter.get("/getactivityid/:id",jwtUser.verifyJwtUser,UserController.getActivityById)
userRouter.post("/activityrequest/:id",jwtUser.verifyJwtUser,UserController.activityRequest)
userRouter.get("/getrequest",jwtUser.verifyJwtUser,UserController.getRequest)
userRouter.put("/acceptJoinRequest/:activityId/:joinRequestId",jwtUser.verifyJwtUser,UserController.acceptJoinRequest)
userRouter.put("/declineJoinRequest/:activityId/:joinRequestId",jwtUser.verifyJwtUser,UserController.declineJoinRequest)
userRouter.post("/requestedId",jwtUser.verifyJwtUser,UserController.acceptedUserId)
userRouter.post("/activity",jwtUser.verifyJwtUser,UserController.activity)
userRouter.post("/chat",jwtUser.verifyJwtUser,UserController.chatStoring)
userRouter.get("/chatmessages",jwtUser.verifyJwtUser,UserController.getChatMessages)
userRouter.post("/chatuser",jwtUser.verifyJwtUser,UserController.getChatUser)
userRouter.post("/rating",jwtUser.verifyJwtUser,UserController.turfRating)
userRouter.post("/getrating",jwtUser.verifyJwtUser,UserController.getRating)
userRouter.post("/ratingUser",jwtUser.verifyJwtUser,UserController.getUserRating)
userRouter.post("/storeToken",jwtUser.verifyJwtUser, UserController.storeToken);
userRouter.post("/getTurfAverageRating", jwtUser.verifyJwtUser, UserController.getTurfAverageRating);














export default userRouter;
