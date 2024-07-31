"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtUser_1 = __importDefault(require("../../FrameWorks/Middlewares/jwt/jwtUser"));
const userRepositary_1 = __importDefault(require("../DataAccess/Repositary/userRepositary"));
const UserModel_1 = __importDefault(require("../DataAccess/Models/UserModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtUser_2 = __importDefault(require("../../FrameWorks/Middlewares/jwt/jwtUser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("../../Business/utils/nodemailer"));
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
const userService_1 = __importDefault(require("../../Business/services/userService"));
dotenv_1.default.config();
const cloudinary_1 = require("../../FrameWorks/Middlewares/cloudinary");
const turfModel_1 = __importDefault(require("../DataAccess/Models/turfModel"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
try {
}
catch (error) { }
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otp = generateOtp();
        yield nodemailer_1.default.sendOTPByEmail(req.body.email, otp);
        const token = jwtUser_2.default.generateToken(otp);
        res.cookie("otp", token, {
            expires: new Date(Date.now() + 180000),
            httpOnly: true, // Ensures cookie is not accessible via JavaScript
            secure: true, // Set to true in production (HTTPS)
            //@ts-ignore
            sameSite: 'None' // Allows cookies to be sent cross-origin
        });
        res.status(201).json({ status: 201, message: "User created successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});
function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
}
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const verifyUser = yield userService_1.default.verifyLogin(req.body);
        if (verifyUser && typeof verifyUser !== "boolean") {
            if (verifyUser.isBlocked) {
                res.status(403).json({ status: 403, message: "user is blocked" });
            }
            else {
                const role = verifyUser.role || "user";
                const token = jwtUser_1.default.generateToken(verifyUser._id.toString(), role);
                res
                    .status(200)
                    .json({ status: 200, message: "Login successful", token });
            }
        }
        else {
            res
                .status(401)
                .json({ status: 401, message: "Invalid Email or Password" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        const token = req.cookies.otp;
        console.log("Received OTP token:", token);
        const secretKey = process.env.USER_SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined in environment variables");
        }
        const jwtOtp = jsonwebtoken_1.default.verify(token, secretKey);
        if (typeof jwtOtp === "string") {
            res
                .status(400)
                .json({ status: 400, message: "Invalid or expired token" });
            return;
        }
        if (otp === jwtOtp.id) {
            res
                .status(200)
                .json({ status: 200, message: "OTP verified successfully" });
            const newUser = yield userService_1.default.createNewUser(req.body);
        }
        else {
            res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const otp = generateOtp();
        yield nodemailer_1.default.sendOTPByEmail(email, otp);
        const token = jwtUser_2.default.generateToken(otp);
        res.cookie("otp", token, { expires: new Date(Date.now() + 180000) });
        res.status(200).json({ status: 200, message: "OTP resent successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const user = yield UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = generateOtp();
        yield user.save();
        nodemailer_1.default.sendOTPByEmail(email, otp);
        const token = jwtUser_2.default.generateToken(otp);
        res.cookie("forgotOtp", token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: 'play-pitch.vercel.app',
            maxAge: 1000 * 60 * 10
        });
        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const verifyForgot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        const token = req.cookies.forgotOtp;
        const secretKey = process.env.USER_SECRET_KEY;
        if (!secretKey) {
            throw new Error("Secret key is not defined in environment variables");
        }
        const jwtfogotOtp = jsonwebtoken_1.default.verify(token, secretKey);
        if (typeof jwtfogotOtp === "string") {
            res
                .status(400)
                .json({ status: 400, message: "invalid or expired token" });
            return;
        }
        if (otp === jwtfogotOtp.id) {
            res
                .status(200)
                .json({ status: 200, message: "otp verified successfully" });
        }
        else {
            return res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
    }
    catch (error) {
        res.status(500).json({ status: 500, message: "internal server error" });
    }
});
const getTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield userRepositary_1.default.turfGet();
        res.status(200).json(turf);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { credential } = req.body;
    try {
        const { token, user } = yield userService_1.default.authenticateWithGoogle(credential);
        return res.json({ token, user });
    }
    catch (error) {
        console.error("Google authentication failed:", error);
        return res.status(401).json({ error: "Google authentication failed" });
    }
});
const getSingleTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const singleTurf = yield userService_1.default.singTurf(id);
        res.status(200).json(singleTurf);
    }
    catch (error) {
        console.error("Error fetching turf:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getTurfRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { turfId } = req.body;
        const getTurfs = yield userService_1.default.getTurfRating(turfId);
        res.status(200).json(getTurfs);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const findBooking = yield userService_1.default.bookingGet(userId);
        res.status(200).json(findBooking);
    }
    catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const bookingId = req.params.bookingId;
        const BookingById = yield userService_1.default.bookingGetById(userId, bookingId);
        res.status(200).json(BookingById);
    }
    catch (error) {
        console.log("error");
        res.status(500).json({ message: "internal server error" });
    }
});
const checkSlotAvailibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { turfDetail, selectedDate, selectedStartTime, selectedEndTime } = req.body;
        const turfId = turfDetail._id;
        const slot = yield userService_1.default.slotavailability(turfId, selectedDate, selectedStartTime, selectedEndTime);
        res.status(200).json(slot);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const stripePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { totalPrice, selectedDate, ownerId, selectedStartTime, selectedEndTime, turfDetail, } = req.body;
        if (!totalPrice || typeof totalPrice !== "number" || totalPrice <= 0) {
            return res.status(400).json({ message: "Invalid totalPrice" });
        }
        const sessionId = yield userService_1.default.createStripeSession(totalPrice, selectedDate, ownerId, selectedStartTime, selectedEndTime, turfDetail);
        res.json({ id: sessionId });
    }
    catch (error) {
        console.error("Error occurred while processing payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const stripeBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { selectedStartTime, turfId, date, selectedEndTime, totalPrice, ownerId, } = req.body;
        if (!req.id) {
            return res.status(400).json({ message: "User ID is missing" });
        }
        const userId = req.id;
        const createdBooking = yield userService_1.default.createBookingAndAdjustWallet(userId, turfId, ownerId, date, selectedStartTime, selectedEndTime, totalPrice);
        res.status(201).json(createdBooking);
    }
    catch (error) {
        console.error("Error occurred while creating booking entry:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(400).json({ error: "User ID is missing" });
        }
        const user = yield userService_1.default.getUserDetails(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error getting user details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const userDetailsEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { formData } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID is missing" });
        }
        const updateUser = yield userService_1.default.editUserDetails(userId, req.body);
        res.status(200).json(updateUser);
    }
    catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPassword = req.body.password;
        const userId = req.id;
        if (!userId) {
            res.status(400).json({ error: "User ID is missing" });
            return;
        }
        yield userService_1.default.resetPassword(userId, newPassword);
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const editUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const { username, email, phone } = req.body;
        let profilePhotoUrl;
        if (req.file) {
            const result = yield cloudinary_1.cloudinaryInstance.uploader.upload(req.file.path);
            profilePhotoUrl = result.secure_url;
        }
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, { username, email, phone, profilePhotoUrl }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            message: "User details updated successfully",
            profilePhotoUrl,
        });
    }
    catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    try {
        const booking = yield userService_1.default.UserCancelBooking(id);
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const payWithWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
        }
        const userIdString = String(userId);
        const { selectedStartTime, turfDetail, selectedDate, selectedEndTime, totalPrice, ownerId, paymentMethod, } = req.body;
        const user = yield userRepositary_1.default.getUserById(userIdString);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.wallet < totalPrice) {
            return res
                .status(400)
                .json({ message: "Insufficient balance in the wallet" });
        }
        const bookingResult = yield userService_1.default.bookWithWallet(userIdString, ownerId, selectedStartTime, turfDetail, selectedDate, selectedEndTime, totalPrice, paymentMethod);
        return res.status(200).json({ message: bookingResult.message });
    }
    catch (error) {
        console.error("Error occurred while processing payment with wallet:", error);
        return res
            .status(500)
            .json({ message: "Failed to process payment with wallet" });
    }
});
const chatStoring = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender, message, roomId, chatUser } = req.body;
        const timeStamp = new Date();
        const chat = { sender, message, timeStamp, roomId, chatUser };
        const savedChatMessages = yield userService_1.default.saveChatMessages(chat);
        res.status(200).json(savedChatMessages);
    }
    catch (error) {
        console.error("Error storing chat message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activityId } = req.query;
        const chatMessages = yield userService_1.default.getChat(activityId);
        res.status(200).json(chatMessages);
    }
    catch (error) {
        console.log(error);
    }
});
const getChatUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const chatUser = yield userService_1.default.chatUser(userId);
        res.status(200).json(chatUser);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const turfRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message, rating, turfId, userName } = req.body;
        const userId = req.id;
        if (userId) {
            const saveRating = yield userService_1.default.ratingSave(userId, turfId, message, rating, userName);
            res.status(200).json(saveRating);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error" });
    }
});
const getRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const ratings = yield userService_1.default.getRating(userId);
        res.status(200).json(ratings);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server Error" });
    }
});
const getUserRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const users = yield userService_1.default.usersRating(userId);
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server Error" });
    }
});
const getTurfAverageRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { turfId } = req.body;
        const ratings = yield userService_1.default.getTurfRatings(turfId);
        if (ratings.length === 0) {
            res.status(404).json({ message: "No ratings found for this turf" });
            return;
        }
        const totalRating = ratings.reduce((acc, curr) => acc + parseInt(curr.rating), 0);
        const averageRating = totalRating / ratings.length;
        const maxRating = 5;
        const ratingOutOfFive = (averageRating / maxRating) * 5;
        res.status(200).json({ averageRating: ratingOutOfFive });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error" });
    }
});
const nearestTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, query } = req.body;
    try {
        const nearbyTurfs = yield turfModel_1.default.find({
            latitude: { $gt: latitude - 0.1, $lt: latitude + 0.1 },
            longitude: { $gt: longitude - 0.1, $lt: longitude + 0.1 },
        });
        res.status(200).json({
            success: true,
            nearestTurf: nearbyTurfs[0],
        });
    }
    catch (error) {
        console.error("Error finding nearest turf:", error);
        res
            .status(500)
            .json({ success: false, error: "Error finding nearest turf" });
    }
});
const searchTurfName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const searchResults = yield userService_1.default.searchName(query);
        res.json(searchResults);
    }
    catch (error) {
        console.error("Error searching turf names:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const getTurfSearchSuggestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        const suggestions = yield userService_1.default.fetchTurfSuggestionsFromDatabase(query);
        res.json({ suggestions });
    }
    catch (error) {
        console.error("Error fetching turf search suggestions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = {
    signup,
    login,
    verifyOtp,
    resendOtp,
    forgotPassword,
    sendOtp,
    getTurf,
    verifyForgot,
    googleAuth,
    getSingleTurf,
    getTurfRating,
    getBooking,
    getBookingById,
    checkSlotAvailibility,
    stripePayment,
    stripeBooking,
    getDetails,
    userDetailsEdit,
    resetPassword,
    editUserDetails,
    cancelBooking,
    payWithWallet,
    chatStoring,
    getChatMessages,
    getChatUser,
    turfRating,
    getRating,
    getUserRating,
    getTurfAverageRating,
    nearestTurf,
    searchTurfName,
    getTurfSearchSuggestions,
};
