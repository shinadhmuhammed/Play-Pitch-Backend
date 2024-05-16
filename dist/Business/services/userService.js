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
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/UserModel"));
const userRepositary_1 = __importDefault(require("../../Adapters/DataAccess/Repositary/userRepositary"));
const google_auth_library_1 = require("google-auth-library");
const jwtUser_1 = __importDefault(require("../../FrameWorks/Middlewares/jwt/jwtUser"));
const turfModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/turfModel"));
const bookingModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/bookingModel"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const ownerModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/ownerModel"));
const adminModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/adminModel"));
const activityModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/activityModel"));
const chatModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/chatModel"));
const RatingModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/RatingModel"));
dotenv_1.default.config();
const createNewUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(user.password, 5);
        user.password = hashedPassword;
        const existingUser = yield userRepositary_1.default.findUser(user.email);
        if (existingUser) {
            throw new Error("User already exists");
        }
        const newUser = new UserModel_1.default(user);
        yield newUser.save();
        return { message: "user created" };
    }
    catch (error) {
        console.log(error);
        return { message: "user not created" };
    }
});
const verifyLogin = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDetails = yield userRepositary_1.default.findUser(user.email);
        if (userDetails !== undefined && userDetails !== null) {
            const passwordMatch = yield bcrypt_1.default.compare(user.password, userDetails.password);
            if (passwordMatch) {
                const { _id, email, password, isBlocked } = userDetails;
                return { _id, email, password, isBlocked, role: "user" };
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
const checkUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const findUser = yield userRepositary_1.default.findUser(userId);
        if (findUser !== undefined) {
            if (findUser !== null) {
                if (findUser.email) {
                    return { message: "user Exists" };
                }
                else {
                    return { message: "User Not Found" };
                }
            }
        }
        return { message: "User Not Found" };
    }
    catch (error) {
        console.log("error is happening for verifying");
    }
});
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authenticateWithGoogle = (credential) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Google authentication failed: Payload is missing");
    }
    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    let user = yield UserModel_1.default.findOne({ googleId: userId });
    if (!user) {
        user = new UserModel_1.default({
            googleId: userId,
            email,
            name,
            password: "defaultPassword",
        });
        yield user.save();
    }
    const token = jwtUser_1.default.generateToken(user._id.toString(), "user");
    return { token, user };
});
const singTurf = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield turfModel_1.default.findById(id);
        if (!turf) {
            throw new Error("Turf not found");
        }
        return turf;
    }
    catch (error) {
        console.error("Error fetching turf:", error);
        throw new Error("Failed to fetch turf");
    }
});
const bookingGet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield bookingModel_1.default.find({ userId: userId });
        return booking;
    }
    catch (error) {
        console.log(error);
    }
});
const bookingGetById = (userId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield bookingModel_1.default.findOne({
            userId: userId,
            _id: bookingId,
        });
        if (!booking) {
            throw new Error("Booking not found");
        }
        const user = yield UserModel_1.default.findById({ _id: userId });
        const turfDetails = yield turfModel_1.default.findOne({ _id: booking.turfId });
        return { booking, turfDetails, user };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
const slotavailability = (turfId, date, selectedStartTime, selectedEndTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const available = yield userRepositary_1.default.slotBooking(turfId, date, selectedStartTime, selectedEndTime);
        return available;
    }
    catch (error) {
        console.log(error);
    }
});
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not defined");
}
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createStripeSession = (totalPrice, selectedDate, ownerId, selectedStartTime, selectedEndTime, turfDetail) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = yield stripe.customers.create({
        name: "shinadh",
        email: "muhammedshinadh@gmail.com",
        address: {
            state: "kerala",
            line1: "123 kfaj kfdsj",
            postal_code: "672732",
            country: "US",
            city: "palakkad",
        },
    });
    const session = yield stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Turf Booking",
                    },
                    unit_amount: totalPrice * 100,
                },
                quantity: 1,
            },
        ],
        customer: customer.id,
        mode: "payment",
        success_url: `http://localhost:5173/booking-verification?turfId=${encodeURIComponent(turfDetail._id)}&date=${encodeURIComponent(selectedDate)}&selectedStartTime=${encodeURIComponent(selectedStartTime)}&selectedEndTime=${encodeURIComponent(selectedEndTime)}&paymentMethod=online&totalPrice=${encodeURIComponent(totalPrice.toString())}&ownerId=${encodeURIComponent(ownerId)}`,
        cancel_url: "http://localhost:5173/booking-cancel",
    });
    return session.id;
});
const createBookingAndAdjustWallet = (userId, turfId, ownerId, date, selectedStartTime, selectedEndTime, totalPrice) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentTime = new Date();
        const bookingData = {
            ownerId: ownerId,
            turfId: turfId,
            date: date,
            userId: userId,
            selectedSlot: `${selectedStartTime} - ${selectedEndTime}`,
            totalPrice: totalPrice,
            Time: currentTime,
            paymentMethod: "online",
        };
        const createdBooking = yield bookingModel_1.default.create(bookingData);
        const turf = yield turfModel_1.default.findById(turfId);
        if (!turf) {
            throw new Error("Turf not found");
        }
        const ownerAmount = totalPrice * 0.9;
        const adminAmount = totalPrice * 0.1;
        const owner = yield ownerModel_1.default.findOneAndUpdate({ _id: ownerId }, {
            $inc: { wallet: ownerAmount },
            $push: {
                walletStatements: {
                    date: currentTime,
                    walletType: "wallet",
                    amount: ownerAmount,
                    turfName: turf.turfName,
                    transactionType: "credit",
                },
            },
        }, { new: true });
        const adminEmail = "admin@gmail.com";
        const admin = yield adminModel_1.default.findOneAndUpdate({ email: adminEmail }, {
            $inc: { wallet: adminAmount },
            $push: {
                walletStatements: {
                    date: currentTime,
                    walletType: "wallet",
                    amount: adminAmount,
                    turfName: turf.turfName,
                    transactionType: "credit",
                },
            },
        }, { new: true });
        return createdBooking;
    }
    catch (error) {
        throw new Error("Failed to create booking and adjust wallet");
    }
});
const getUserDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.default.findById(userId);
        return user;
    }
    catch (error) {
        console.error("Error retrieving user details:", error);
        throw new Error("Failed to retrieve user details");
    }
});
const editUserDetails = (userId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield UserModel_1.default.findByIdAndUpdate(userId, userData, {
            new: true,
        });
        return updatedUser;
    }
    catch (error) {
        console.error("Error updating user details:", error);
        throw new Error("Failed to update user details");
    }
});
const resetPassword = (userId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const user = yield UserModel_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.password = hashedPassword;
        yield user.save();
    }
    catch (error) {
        throw new Error("Error resetting password");
    }
});
const UserCancelBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cancellationTime = new Date();
        const booking = yield bookingModel_1.default.findOneAndUpdate({ _id: id, bookingStatus: "confirmed" }, { $set: { bookingStatus: "cancelled" } }, { new: true });
        let refundAmount = 0;
        if (booking) {
            const bookingDate = new Date(booking.date);
            const bookingTime = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate(), parseInt(booking.selectedSlot.split(":")[0]), 0, 0);
            const timeDifference = bookingTime.getTime() - cancellationTime.getTime();
            const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
            if (hoursDifference < 1) {
                refundAmount = 0;
            }
            else if (hoursDifference < 10) {
                refundAmount = booking.totalPrice / 2;
            }
            else {
                refundAmount = booking.totalPrice;
            }
        }
        const turf = yield turfModel_1.default.findById(booking === null || booking === void 0 ? void 0 : booking.turfId);
        const user = yield UserModel_1.default.findById(booking === null || booking === void 0 ? void 0 : booking.userId);
        if (user) {
            user.wallet += refundAmount;
            const walletStatement = {
                date: new Date(),
                walletType: "refund",
                turfName: turf === null || turf === void 0 ? void 0 : turf.turfName,
                amount: refundAmount,
                transaction: "credit",
            };
            user.walletStatements.push(walletStatement);
            yield user.save();
            return booking;
        }
    }
    catch (error) {
        console.log(error);
    }
});
const bookWithWallet = (userId, ownerId, selectedStartTime, turfId, date, selectedEndTime, totalPrice, paymentMethod) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepositary_1.default.getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.wallet < totalPrice) {
            throw new Error("Insufficient balance in the wallet");
        }
        const updatedWalletAmount = user.wallet - totalPrice;
        if (updatedWalletAmount < 0) {
            throw new Error("Wallet balance cannot be negative");
        }
        yield userRepositary_1.default.updatedWalletBalance(userId, updatedWalletAmount);
        yield userRepositary_1.default.recordTransactionInWallet(userId, turfId, totalPrice, "debit");
        const newBooking = new bookingModel_1.default({
            userId: userId,
            turfId: turfId,
            ownerId: ownerId,
            date: date,
            selectedSlot: `${selectedStartTime} - ${selectedEndTime}`,
            totalPrice: totalPrice,
            Time: new Date(),
            paymentMethod: paymentMethod,
            bookingStatus: "confirmed",
        });
        yield newBooking.save();
        return { message: "Booking successful" };
    }
    catch (error) {
        console.error("Error occurred while booking with wallet:", error);
        throw new Error("Failed to book with wallet");
    }
});
const createActivity = (formData, bookingDetails, turfDetails, user) => __awaiter(void 0, void 0, void 0, function* () {
    const activityData = {
        activityName: formData.activityName,
        bookingId: bookingDetails._id,
        maxPlayers: formData.maxPlayers,
        description: formData.description,
        turfId: bookingDetails.turfId,
        userId: bookingDetails.userId,
        turfName: turfDetails.turfName,
        userName: user.username,
        slot: bookingDetails.selectedSlot,
        date: bookingDetails.date,
        address: turfDetails.address,
    };
    try {
        const existingActivity = yield userRepositary_1.default.getActivityByBookingId(bookingDetails._id);
        if (existingActivity) {
            throw new Error("Activity with the same booking ID already exists");
        }
        const newActivity = yield userRepositary_1.default.createActivity(activityData);
        return newActivity;
    }
    catch (error) {
        throw new Error("Could not create activity");
    }
});
const getActivity = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield userRepositary_1.default.getActivity();
        return activity;
    }
    catch (error) {
        console.log(error);
    }
});
const getActivityById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(id);
        return activity;
    }
    catch (error) {
        console.log(error);
    }
});
const activityRequest = (activityId, userId, username, phone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        if (!activity) {
            throw new Error("Activity not found");
        }
        const existingRequest = yield userRepositary_1.default.existingRequest(activityId, userId);
        if (existingRequest) {
            throw new Error("Request already sent");
        }
        activity.joinRequests.push({ user: userId, username: username, phone: phone, status: "pending" });
        const user = yield UserModel_1.default.findById(userId);
        // if(user?.notificationToken){
        //   await sendNotification(user.notificationToken, { title: 'New Message', body: 'You have a new message!' });
        // }
        yield activity.save();
        return activity;
    }
    catch (error) {
        throw error;
    }
});
const declinedRequest = (activityId, joinRequestId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        if (activity) {
            const joinRequest = activity.joinRequests.find((request) => { var _a; return ((_a = request === null || request === void 0 ? void 0 : request._id) === null || _a === void 0 ? void 0 : _a.toString()) === joinRequestId; });
            if (joinRequest) {
                joinRequest.status = "rejected";
            }
            yield activity.save();
        }
    }
    catch (error) {
        throw error;
    }
});
const acceptedRequest = (activityId, joinRequestId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        if (activity) {
            const joinRequest = activity.joinRequests.find((request) => { var _a; return ((_a = request === null || request === void 0 ? void 0 : request._id) === null || _a === void 0 ? void 0 : _a.toString()) === joinRequestId; });
            if (joinRequest) {
                joinRequest.status = "accepted";
            }
            yield activity.save();
        }
    }
    catch (error) {
        throw error;
    }
});
const addedUserId = (activity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!activity.participants) {
            console.log("Participants array is empty or null");
            return [];
        }
        const participantIds = activity.participants.map((participant) => participant);
        const participantDetails = yield UserModel_1.default.find({
            _id: { $in: participantIds },
        });
        return participantDetails;
    }
    catch (error) {
        console.log(error);
    }
});
const saveChatMessages = (chat) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chatMessages = new chatModel_1.default({
            sender: chat.sender,
            message: chat.message,
            activityId: chat.roomId,
            timeStamp: chat.timeStamp,
            senderName: chat.chatUser,
        });
        const saveChatMessages = yield chatMessages.save();
        return saveChatMessages;
    }
    catch (error) {
        console.error("Error saving chat message:", error);
        throw new Error("Failed to save chat message");
    }
});
const getChat = (activityId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getChat = yield chatModel_1.default.find({ activityId });
        return getChat;
    }
    catch (error) {
        console.log(error);
    }
});
const chatUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepositary_1.default.findChatUser(userId);
        return user;
    }
    catch (error) {
        console.error("Error reciving user:", error);
        throw new Error("Failed to get the chat user");
    }
});
const getTurfRating = (turfId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turfs = yield RatingModel_1.default.find({ turfId: turfId });
        return turfs;
    }
    catch (error) { }
});
const ratingSave = (userId, turfId, message, rating, userName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newRating = new RatingModel_1.default({
            userId,
            turfId,
            message,
            rating,
            userName,
        });
        const savedRating = yield newRating.save();
        return savedRating;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to save rating");
    }
});
const getRating = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield RatingModel_1.default.find({ userId: userId });
        return ratings;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to get rating");
    }
});
const usersRating = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.default.findById(userId);
        return users;
    }
    catch (error) {
        throw new Error("Failed to get user");
    }
});
const getTurfRatings = (turfId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield RatingModel_1.default.find({ turfId });
        return ratings;
    }
    catch (error) {
        throw new Error("Error fetching ratings for the turf");
    }
});
const searchName = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchResults = yield userRepositary_1.default.searchTurfName(query);
        return searchResults;
    }
    catch (error) {
        throw error;
    }
});
const fetchTurfSuggestionsFromDatabase = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const regex = new RegExp(`^${query}`, 'i');
        const turfs = yield turfModel_1.default.find({ turfName: regex }).limit(10);
        const suggestions = turfs.map((turf) => turf.turfName);
        return suggestions;
    }
    catch (error) {
        console.error("Error fetching turf search suggestions:", error);
        throw error;
    }
});
const activityResults = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield activityModel_1.default.find({ activityName: { $regex: new RegExp(query, 'i') } });
        return activities;
    }
    catch (error) {
        throw error;
    }
});
const userActivities = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield activityModel_1.default.find({ userId });
        return activities;
    }
    catch (error) {
        throw error;
    }
});
const editActivites = (id, activityName, maxPlayers, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(id);
        if (activity) {
            if (activityName) {
                activity.activityName = activityName;
            }
            if (maxPlayers) {
                activity.maxPlayers = maxPlayers;
            }
            if (description) {
                activity.description = description;
            }
            yield activity.save();
        }
        return activity;
    }
    catch (error) {
        throw error;
    }
});
exports.default = {
    createNewUser,
    verifyLogin,
    checkUser,
    authenticateWithGoogle,
    singTurf,
    bookingGet,
    bookingGetById,
    slotavailability,
    createStripeSession,
    createBookingAndAdjustWallet,
    getUserDetails,
    editUserDetails,
    resetPassword,
    UserCancelBooking,
    bookWithWallet,
    createActivity,
    getActivity,
    getActivityById,
    activityRequest,
    declinedRequest,
    acceptedRequest,
    addedUserId,
    saveChatMessages,
    getChat,
    chatUser,
    ratingSave,
    getRating,
    getTurfRating,
    usersRating,
    getTurfRatings,
    searchName,
    fetchTurfSuggestionsFromDatabase,
    activityResults,
    userActivities,
    editActivites
};
