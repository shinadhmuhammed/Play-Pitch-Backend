"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRouter = express_1.default.Router();
const UserController_1 = __importDefault(require("../../Adapters/Controllers/UserController"));
const jwtUser_1 = __importDefault(require("../Middlewares/jwt/jwtUser"));
const multer_1 = __importDefault(require("../Middlewares/multer"));
const ActivityController_1 = __importDefault(require("../../Adapters/Controllers/ActivityController"));
const multerUpload = multer_1.default;
userRouter.post("/signup", UserController_1.default.signup);
userRouter.post("/verify-otp", UserController_1.default.verifyOtp);
userRouter.post("/resendotp", UserController_1.default.resendOtp);
userRouter.post("/login", UserController_1.default.login);
userRouter.post("/forgotpassword", UserController_1.default.forgotPassword);
userRouter.post("/sendotp", UserController_1.default.sendOtp);
userRouter.post("/verify-forgot", UserController_1.default.verifyForgot);
userRouter.post("/google-login", UserController_1.default.googleAuth);
userRouter.get("/getturf", jwtUser_1.default.verifyJwtUser, UserController_1.default.getTurf);
userRouter.get("/getturfs", UserController_1.default.getTurf);
userRouter.get('/getTurf/:id', jwtUser_1.default.verifyJwtUser, UserController_1.default.getSingleTurf);
userRouter.get('/getTurfs/:id', UserController_1.default.getSingleTurf);
userRouter.post('/turfrating', UserController_1.default.getTurfRating);
userRouter.get('/getbooking', jwtUser_1.default.verifyJwtUser, UserController_1.default.getBooking);
userRouter.get('/getbooking/:bookingId', jwtUser_1.default.verifyJwtUser, UserController_1.default.getBookingById);
userRouter.post('/slotavailability', jwtUser_1.default.verifyJwtUser, UserController_1.default.checkSlotAvailibility);
userRouter.post('/stripepayment', jwtUser_1.default.verifyJwtUser, UserController_1.default.stripePayment);
userRouter.post('/paywithwallet', jwtUser_1.default.verifyJwtUser, UserController_1.default.payWithWallet);
userRouter.post('/create-booking', jwtUser_1.default.verifyJwtUser, UserController_1.default.stripeBooking);
userRouter.get("/userdetails", jwtUser_1.default.verifyJwtUser, UserController_1.default.getDetails);
userRouter.post("/reset-password", jwtUser_1.default.verifyJwtUser, UserController_1.default.resetPassword);
userRouter.post("/userDetailsEdit", multerUpload.single("profilePhoto"), jwtUser_1.default.verifyJwtUser, UserController_1.default.editUserDetails);
userRouter.post("/cancelbooking", jwtUser_1.default.verifyJwtUser, UserController_1.default.cancelBooking);
userRouter.post("/createactivity", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.createActivity);
userRouter.get("/getactivity", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.getActivity);
userRouter.get("/getactivityid/:id", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.getActivityById);
userRouter.post("/activityrequest/:id", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.activityRequest);
userRouter.get("/getrequest", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.getRequest);
userRouter.put("/acceptJoinRequest/:activityId/:joinRequestId", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.acceptJoinRequest);
userRouter.put("/declineJoinRequest/:activityId/:joinRequestId", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.declineJoinRequest);
userRouter.post("/requestedId", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.acceptedUserId);
userRouter.post("/activity", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.activity);
userRouter.put("/activities/:id", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.editActivites);
userRouter.post("/getActivity", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.getActivities);
userRouter.get("/searchActivity", jwtUser_1.default.verifyJwtUser, ActivityController_1.default.searchActivity);
userRouter.post("/chat", jwtUser_1.default.verifyJwtUser, UserController_1.default.chatStoring);
userRouter.get("/chatmessages", jwtUser_1.default.verifyJwtUser, UserController_1.default.getChatMessages);
userRouter.post("/chatuser", jwtUser_1.default.verifyJwtUser, UserController_1.default.getChatUser);
userRouter.post("/rating", jwtUser_1.default.verifyJwtUser, UserController_1.default.turfRating);
userRouter.post("/getrating", jwtUser_1.default.verifyJwtUser, UserController_1.default.getRating);
userRouter.post("/ratingUser", jwtUser_1.default.verifyJwtUser, UserController_1.default.getUserRating);
userRouter.post("/searchTurfName", jwtUser_1.default.verifyJwtUser, UserController_1.default.searchTurfName);
userRouter.post("/searchTurfNames", UserController_1.default.searchTurfName);
userRouter.post("/getTurfAverageRating", UserController_1.default.getTurfAverageRating);
userRouter.post("/nearestTurf", UserController_1.default.nearestTurf);
userRouter.post("/getTurfSearchSuggestions", jwtUser_1.default.verifyJwtUser, UserController_1.default.getTurfSearchSuggestions);
exports.default = userRouter;
