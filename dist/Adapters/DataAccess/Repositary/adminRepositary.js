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
const adminModel_1 = __importDefault(require("../Models/adminModel"));
const UserModel_1 = __importDefault(require("../Models/UserModel"));
const turfModel_1 = __importDefault(require("../Models/turfModel"));
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const moment_1 = __importDefault(require("moment"));
const findAdmin = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminData = yield adminModel_1.default.findOne({ email: email });
        return adminData;
    }
    catch (error) {
        console.log(error);
    }
});
const getusers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield UserModel_1.default.find();
        return users;
    }
    catch (error) {
        console.log(error);
    }
});
const blockunblock = (email, isBlocked) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield UserModel_1.default.updateOne({ email: email }, { $set: { isBlocked: !isBlocked } });
    }
    catch (error) {
        console.log("error in blocking the user", error);
    }
});
const getTurf = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turf = yield turfModel_1.default.find();
        return turf;
    }
    catch (error) {
        console.log(error);
    }
});
const getVenueId = (venueId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venue = yield turfModel_1.default.findOne({ _id: venueId });
        return venue;
    }
    catch (error) {
        console.log(error);
    }
});
const bookingdashboardRepositary = () => __awaiter(void 0, void 0, void 0, function* () {
    const getTotalBookings = yield bookingModel_1.default.countDocuments();
    return getTotalBookings;
});
const UserDashboardRepository = () => __awaiter(void 0, void 0, void 0, function* () {
    const getTotalUsers = yield UserModel_1.default.countDocuments();
    return getTotalUsers;
});
const getTodayBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const todayStart = (0, moment_1.default)().startOf('day');
    const todayEnd = (0, moment_1.default)().endOf('day');
    return yield bookingModel_1.default.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd }
    });
});
const getMonthlyBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const firstDayOfMonth = (0, moment_1.default)().startOf('month');
    const lastDayOfMonth = (0, moment_1.default)().endOf('month');
    return yield bookingModel_1.default.countDocuments({
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
});
exports.default = {
    findAdmin,
    getusers,
    blockunblock,
    getTurf,
    getVenueId,
    UserDashboardRepository,
    bookingdashboardRepositary,
    getTodayBookings,
    getMonthlyBookings
};
