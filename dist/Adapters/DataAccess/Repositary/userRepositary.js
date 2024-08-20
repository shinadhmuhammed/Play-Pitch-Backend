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
const RatingModel_1 = __importDefault(require("../Models/RatingModel"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const activityModel_1 = __importDefault(require("../Models/activityModel"));
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const turfModel_1 = __importDefault(require("../Models/turfModel"));
const moment = require("moment");
const findUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userDatabase = yield UserModel_1.default.findOne({ email: email });
        return userDatabase;
    }
    catch (error) {
        console.log(error);
    }
});
const turfGet = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield turfModel_1.default.find({ isActive: true });
        return turf;
    }
    catch (error) {
        console.log(error);
    }
});
const booking = (turfId, date, startTime, endTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield bookingModel_1.default.findOne({
            turfId: turfId,
            date: date,
            selectedSlot: { $gte: startTime, $lte: endTime },
        });
        return bookings;
    }
    catch (error) {
        console.log(error);
    }
});
const slotBooking = (turfId, date, startTime, endTime) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingBooking = yield bookingModel_1.default.findOne({
            turfId: turfId,
            date: date,
            selectedSlot: { $gte: startTime, $lte: endTime },
        });
        return !existingBooking;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
const bookingSave = (booking) => __awaiter(void 0, void 0, void 0, function* () {
    yield booking.save();
});
const updatedWalletBalance = (userId, updatedWalletAmount) => {
    return UserModel_1.default.findByIdAndUpdate(userId, {
        $set: { wallet: updatedWalletAmount },
    });
};
const getUserById = (userId) => {
    return UserModel_1.default.findById(userId);
};
const recordTransactionInWallet = (userId, turfId, amount, transactionType) => __awaiter(void 0, void 0, void 0, function* () {
    const turf = yield turfModel_1.default.findById(turfId);
    const transaction = {
        date: new Date(),
        walletType: "wallet",
        amount: amount,
        turfName: turf === null || turf === void 0 ? void 0 : turf.turfName,
        transactionType: transactionType,
    };
    return UserModel_1.default.findByIdAndUpdate(userId, {
        $push: {
            walletStatements: transaction,
        },
    });
});
const getActivityByBookingId = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findOne({ bookingId: bookingId });
        return activity;
    }
    catch (error) {
        console.log(error);
    }
});
const createActivity = (activityData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newActivity = activityModel_1.default.create(activityData);
        return newActivity;
    }
    catch (error) {
        console.log(error);
    }
});
const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) {
        throw new Error("Date or time string is undefined or empty.");
    }
    const datePart = moment(dateStr).format("YYYY-MM-DD");
    const timePart = timeStr.split(" - ")[0];
    return moment(`${datePart} ${timePart}`, "YYYY-MM-DD HH:mm");
};
const getActivity = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = moment();
        const activities = yield activityModel_1.default.find();
        yield Promise.all(activities.map((activity) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const activityDateTime = parseDateTime(activity.date, activity.slot);
                if (currentDate.isAfter(activityDateTime)) {
                    activity.status = "completed";
                    yield activity.save();
                }
            }
            catch (error) {
                console.error("Error processing activity:", error);
            }
        })));
        const ongoingActivities = activities.filter((activity) => activity.status === "ongoing");
        return ongoingActivities;
    }
    catch (error) {
        console.error("Error fetching activities:", error);
        throw error;
    }
});
const existingRequest = (activityId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        const Requests = activity === null || activity === void 0 ? void 0 : activity.joinRequests.find((request) => { var _a; return ((_a = request.user) === null || _a === void 0 ? void 0 : _a.toString()) === userId; });
        return Requests;
    }
    catch (error) {
        console.error("Error checking existing request:", error);
        throw new Error("Could not check existing request");
    }
});
const findChatUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.default.findById(userId);
        console.log(user);
        return user;
    }
    catch (error) {
        console.error("Error reciving user:", error);
        throw new Error("Failed to get the chat user");
    }
});
const ratingGet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ratings = yield RatingModel_1.default.findById({ userId });
        return ratings;
    }
    catch (error) { }
});
const searchTurfName = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchResults = yield turfModel_1.default.find({
            turfName: { $regex: query, $options: "i" },
        });
        return searchResults;
    }
    catch (error) {
        throw error;
    }
});
exports.default = {
    findUser,
    turfGet,
    booking,
    bookingSave,
    slotBooking,
    getUserById,
    updatedWalletBalance,
    recordTransactionInWallet,
    createActivity,
    getActivity,
    getActivityByBookingId,
    existingRequest,
    findChatUser,
    ratingGet,
    searchTurfName,
};
