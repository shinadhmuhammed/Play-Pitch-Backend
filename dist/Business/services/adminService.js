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
const adminModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/adminModel"));
const turfModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/turfModel"));
const adminRepositary_1 = __importDefault(require("../../Adapters/DataAccess/Repositary/adminRepositary"));
const adminLogin = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = yield adminRepositary_1.default.findAdmin(email);
        if (admin && admin.password === password) {
            return admin;
        }
        else {
            return null;
        }
    }
    catch (error) {
        throw error;
    }
});
const blockunblock = (email, isBlocked) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockAndUnblock = yield adminRepositary_1.default.blockunblock(email, isBlocked);
        if (blockAndUnblock) {
            return { message: true };
        }
        else {
            return { message: null };
        }
    }
    catch (error) {
        console.log("error in blocking and unblocking", error);
        return { message: null };
    }
});
const getAllVenues = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venues = yield turfModel_1.default.aggregate([
            {
                $lookup: {
                    from: "ownermodels",
                    localField: "turfOwner",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $unwind: "$owner",
            },
            {
                $project: {
                    _id: 1,
                    turfName: 1,
                    address: 1,
                    city: 1,
                    aboutVenue: 1,
                    facilities: 1,
                    openingTime: 1,
                    closingTime: 1,
                    contactNumber: 1,
                    price: 1,
                    turfOwnerEmail: "$owner.email",
                    isActive: 1,
                    image: { $arrayElemAt: ["$images", 0] },
                },
            },
        ]);
        return venues;
    }
    catch (error) {
        console.log(error);
    }
});
const acceptVenueRequests = (turfId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield turfModel_1.default.findById(turfId);
        if (!turf) {
            throw new Error("Turf Not Found");
        }
        turf.isActive = true;
        yield turf.save();
        return turf;
    }
    catch (error) {
        console.log(error, "Error Accepting Turf");
    }
});
const declineVenueRequests = (turfId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield turfModel_1.default.findById(turfId);
        if (!turf) {
            throw new Error("Turf Not Found");
        }
        turf.isDeclined = true;
        yield turf.save();
        return turf;
    }
    catch (error) {
        console.log(error, "Error Declining Turf");
    }
});
const VenueById = (venueId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venue = yield adminRepositary_1.default.getVenueId(venueId);
        return venue;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
});
const getDashboard = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalBookings = yield adminRepositary_1.default.bookingdashboardRepositary();
        const totalUser = yield adminRepositary_1.default.UserDashboardRepository();
        const todayBookings = yield adminRepositary_1.default.getTodayBookings();
        const monthlyBookings = yield adminRepositary_1.default.getMonthlyBookings();
        console.log(totalBookings, totalUser, todayBookings, monthlyBookings);
        return { totalBookings, totalUser, todayBookings, monthlyBookings };
    }
    catch (error) {
        throw new Error('Error getting dashboard information');
    }
});
const getWallet = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield adminModel_1.default.find();
        return wallet;
    }
    catch (error) {
        throw new Error('Error getting wallet information');
    }
});
exports.default = {
    adminLogin,
    blockunblock,
    getAllVenues,
    acceptVenueRequests,
    declineVenueRequests,
    VenueById,
    getDashboard,
    getWallet
};
