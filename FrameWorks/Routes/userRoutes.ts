import express from "express";
const userRouter = express.Router();
import UserController from "../../Adapters/Controllers/UserController";
import jwtUser from "../Middlewares/jwt/jwtUser";
import { Multer } from "multer";
import upload from "../Middlewares/multer";
import ActivityController from "../../Adapters/Controllers/ActivityController";
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
userRouter.get("/getturfs", UserController.getTurf);
userRouter.get('/getTurf/:id',jwtUser.verifyJwtUser,UserController.getSingleTurf)
userRouter.get('/getTurfs/:id',UserController.getSingleTurf)
userRouter.post('/turfrating',UserController.getTurfRating)
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


userRouter.post("/createactivity",jwtUser.verifyJwtUser,ActivityController.createActivity);
userRouter.get("/getactivity",jwtUser.verifyJwtUser,ActivityController.getActivity)
userRouter.get("/getactivityid/:id",jwtUser.verifyJwtUser,ActivityController.getActivityById)
userRouter.post("/activityrequest/:id",jwtUser.verifyJwtUser,ActivityController.activityRequest)
userRouter.get("/getrequest",jwtUser.verifyJwtUser,ActivityController.getRequest)
userRouter.put("/acceptJoinRequest/:activityId/:joinRequestId",jwtUser.verifyJwtUser,ActivityController.acceptJoinRequest)
userRouter.put("/declineJoinRequest/:activityId/:joinRequestId",jwtUser.verifyJwtUser,ActivityController.declineJoinRequest)
userRouter.post("/requestedId",jwtUser.verifyJwtUser,ActivityController.acceptedUserId)
userRouter.post("/activity",jwtUser.verifyJwtUser,ActivityController.activity)
userRouter.put("/activities/:id", jwtUser.verifyJwtUser, ActivityController.editActivites);
userRouter.post("/getActivity", jwtUser.verifyJwtUser, ActivityController.getActivities);
userRouter.get("/searchActivity", jwtUser.verifyJwtUser, ActivityController.searchActivity);

userRouter.post("/chat",jwtUser.verifyJwtUser,UserController.chatStoring)
userRouter.get("/chatmessages",jwtUser.verifyJwtUser,UserController.getChatMessages)
userRouter.post("/chatuser",jwtUser.verifyJwtUser,UserController.getChatUser)
userRouter.post("/rating",jwtUser.verifyJwtUser,UserController.turfRating)
userRouter.post("/getrating",jwtUser.verifyJwtUser,UserController.getRating)
userRouter.post("/ratingUser",jwtUser.verifyJwtUser,UserController.getUserRating)
userRouter.post("/searchTurfName",jwtUser.verifyJwtUser,UserController.searchTurfName)
userRouter.post("/searchTurfNames",UserController.searchTurfName)
userRouter.post("/getTurfAverageRating",  UserController.getTurfAverageRating);
userRouter.post("/nearestTurf",  UserController.nearestTurf);
userRouter.post("/getTurfSearchSuggestions", jwtUser.verifyJwtUser, UserController.getTurfSearchSuggestions);

















export default userRouter;
