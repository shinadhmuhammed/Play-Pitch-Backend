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
const ownerRepositary_1 = __importDefault(require("../../Adapters/DataAccess/Repositary/ownerRepositary"));
const cloudinary_1 = require("../../FrameWorks/Middlewares/cloudinary");
const turfModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/turfModel"));
const ownerModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/ownerModel"));
const bookingModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/bookingModel"));
const nodemailer_1 = __importDefault(require("../utils/nodemailer"));
const UserModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/UserModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createNewOwner = (owner) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(owner.password, 10);
        owner.password = hashedPassword;
        const existingOwner = yield ownerRepositary_1.default.findOwner(owner.email);
        if (existingOwner) {
            throw new Error("owner already exists");
        }
        const newOwner = new ownerModel_1.default(owner);
        yield newOwner.save();
        return { message: "user created" };
    }
    catch (error) {
        console.log(error);
        return { message: "user not created" };
    }
});
const confirmPassword = (plainPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(plainPassword, hashedPassword);
});
const createTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { turfName, address, city, aboutVenue, facilities, openingTime, closingTime, contactNumber, courtType, latitude, longitude, } = req.body;
        // Ensure courtType is always treated as an array
        const courtTypes = Array.isArray(courtType) ? courtType : [courtType];
        const prices = {};
        courtTypes.forEach((type) => {
            prices[type] = req.body[`${type}-price`];
        });
        console.log(prices, "prices");
        if (!turfName ||
            !address ||
            !city ||
            !aboutVenue ||
            !facilities ||
            !openingTime ||
            !closingTime ||
            !contactNumber ||
            !prices ||
            !courtType ||
            !latitude ||
            !longitude) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (courtTypes.length === 0) {
            return res.status(400).json({ message: "Court type is required" });
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ message: "Image files are required" });
        }
        const files = Array.isArray(req.files) ? req.files : [req.files];
        const uploadedImages = [];
        for (const file of files) {
            const uploadedImage = yield cloudinary_1.cloudinaryInstance.uploader.upload(file.path, {
                upload_preset: "ml_default",
            });
            uploadedImages.push(uploadedImage.secure_url);
        }
        const newTurf = new turfModel_1.default({
            turfName,
            address,
            city,
            aboutVenue,
            facilities,
            openingTime,
            closingTime,
            contactNumber,
            courtType: courtTypes,
            latitude,
            longitude,
            images: uploadedImages,
            turfOwner: req.id,
            isActive: false,
            price: {},
        });
        courtTypes.forEach((type) => {
            if (prices.hasOwnProperty(type)) {
                newTurf.price[type] = prices[type];
            }
            else {
                // newTurf.price[type] = DEFAULT_PRICE;
            }
        });
        console.log(newTurf, 'lllolol');
        yield newTurf.save();
        res.status(201).json({ message: "Turf added successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const editTurf = (id, updatedTurfData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedTurf = yield turfModel_1.default.findByIdAndUpdate(id, updatedTurfData, {
            new: true,
        });
        return updatedTurf;
    }
    catch (error) {
        throw error;
    }
});
const turfDelete = (turfId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield turfModel_1.default.findByIdAndDelete(turfId);
    }
    catch (error) {
        throw error;
    }
});
const getOwnerDetails = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const owner = yield ownerRepositary_1.default.getOwnerById(ownerId);
        return owner;
    }
    catch (error) {
        console.error("Error retrieving user details:", error);
        throw new Error("Failed to retrieve user details");
    }
});
const editDetails = (ownerId, userData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateOwner = yield ownerRepositary_1.default.editDetails(ownerId, userData);
        return updateOwner;
    }
    catch (error) {
        console.error("Error updating owner details:", error);
    }
});
const resetPassword = (ownerId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const owner = yield ownerModel_1.default.findById(ownerId);
        if (!owner) {
            throw new Error("Owner not found");
        }
        owner.password = hashedPassword;
        yield owner.save();
    }
    catch (error) {
        throw new Error("Error resetting password");
    }
});
const ownerCancelBooking = (turfId, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield bookingModel_1.default.findById({ _id: bookingId });
        if (booking) {
            const user = yield UserModel_1.default.findById(booking.userId);
            if (!user) {
                throw new Error("User not found");
            }
            const turf = yield turfModel_1.default.findById(turfId);
            if (!turf) {
                throw new Error("Turf not found");
            }
            const owner = yield ownerModel_1.default.findOne({ _id: turf.turfOwner });
            if (!owner) {
                throw new Error("Owner not found");
            }
            const totalPrice = booking.totalPrice;
            owner.wallet -= totalPrice;
            owner.walletStatements.push({
                date: new Date(),
                walletType: "owner",
                amount: -totalPrice,
                turfName: turf.turfName,
                transactionType: "debit",
            });
            yield owner.save();
            user.wallet += totalPrice;
            user.walletStatements.push({
                date: new Date(),
                walletType: "refund",
                amount: totalPrice,
                turfName: turf.turfName,
                transactionType: "credit",
            });
            yield user.save();
            booking.bookingStatus = "cancelled";
            yield booking.save();
            const emailMessage = `Sorry, your booking for the turf named ${turf === null || turf === void 0 ? void 0 : turf.turfName} has been cancelled due to some reasons. Your refunded amount will be credited to your wallet shortly.`;
            const emailSubject = "Booking Cancellation Notification";
            if (user) {
                yield nodemailer_1.default.sendEmailNotification(user.email, emailMessage, emailSubject);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});
const getDashboardData = (ownerId) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    const totalRevenueToday = yield calculateRevenue(ownerId, today, today);
    const totalBookingsToday = yield calculateTotalBookings(ownerId, today, today);
    const totalRevenueThisMonth = yield calculateRevenue(ownerId, thisMonthStart, today);
    const totalBookingsThisMonth = yield calculateTotalBookings(ownerId, thisMonthStart, today);
    const totalRevenueThisYear = yield calculateRevenue(ownerId, thisYearStart, today);
    const totalBookingsThisYear = yield calculateTotalBookings(ownerId, thisYearStart, today);
    return {
        totalRevenueToday,
        totalBookingsToday,
        totalRevenueThisMonth,
        totalBookingsThisMonth,
        totalRevenueThisYear,
        totalBookingsThisYear,
    };
});
const calculateRevenue = (ownerId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const result = yield bookingModel_1.default.aggregate([
            {
                $match: {
                    bookingStatus: "completed",
                    ownerId: new mongoose_1.default.Types.ObjectId(ownerId),
                    date: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
        ]);
        console.log(result, "result");
        return result.length > 0 ? result[0].totalRevenue : 0;
    }
    catch (error) {
        console.error("Error calculating revenue:", error);
        throw error;
    }
});
const calculateTotalBookings = (ownerId, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const result = yield bookingModel_1.default.countDocuments({
            bookingStatus: "completed",
            ownerId: new mongoose_1.default.Types.ObjectId(ownerId),
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        return result;
    }
    catch (error) {
        console.error("Error calculating total bookings:", error);
        throw error;
    }
});
exports.default = {
    confirmPassword,
    createTurf,
    createNewOwner,
    editTurf,
    turfDelete,
    getOwnerDetails,
    editDetails,
    resetPassword,
    ownerCancelBooking,
    getDashboardData,
};
