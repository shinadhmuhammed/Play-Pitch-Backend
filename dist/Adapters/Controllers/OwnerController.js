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
const ownerRepositary_1 = __importDefault(require("../DataAccess/Repositary/ownerRepositary"));
const ownerService_1 = __importDefault(require("../../Business/services/ownerService"));
const jwtOwner_1 = __importDefault(require("../../FrameWorks/Middlewares/jwt/jwtOwner"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ownerModel_1 = __importDefault(require("../DataAccess/Models/ownerModel"));
const turfModel_1 = __importDefault(require("../DataAccess/Models/turfModel"));
const nodemailer_1 = __importDefault(require("../../Business/utils/nodemailer"));
const bookingModel_1 = __importDefault(require("../DataAccess/Models/bookingModel"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, password } = req.body;
        const otp = generateOTP().toString();
        yield nodemailer_1.default.sendOTPByEmail(email, otp);
        const token = jwtOwner_1.default.generateTokens(otp);
        res.cookie("otp", token, { expires: new Date(Date.now() + 180000) });
        res
            .status(201)
            .json({ status: 201, message: "Owner registered successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
});
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, email, password, phone } = req.body;
        const token = req.cookies.otp;
        const jwtOtp = jsonwebtoken_1.default.verify(token, "Owner@123");
        console.log(jwtOtp);
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
            const newOwner = yield ownerService_1.default.createNewOwner(req.body);
        }
        else {
            res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ status: 500, message: "Internal Server Error" });
    }
});
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const gotp = generateOTP().toString();
        yield nodemailer_1.default.sendOTPByEmail(email, gotp);
        const token = jwtOwner_1.default.generateTokens(gotp);
        res.cookie("otp", token, { expires: new Date(Date.now() + 180000) });
        res.status(200).json({ status: 200, message: "otp resend succesfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: 500, message: "Internal server error" });
    }
});
const ownerLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const owner = yield ownerRepositary_1.default.findOwner(email);
        if (!owner) {
            return res.status(404).json({ status: 404, message: "Owner not found" });
        }
        const isPasswordValid = yield ownerService_1.default.confirmPassword(password, owner.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: "Invalid password" });
        }
        const role = owner.role || 'owner';
        const token = jwtOwner_1.default.generateTokens(owner._id.toString(), role);
        const turf = yield turfModel_1.default.findOne({ turfOwner: owner._id });
        const turfAdded = !!turf;
        res.status(200).json({ status: 200, message: "Login successful", token, turfAdded });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ status: 500, message: "Internal Server Error" });
    }
});
const passwordForgot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        const owner = yield ownerModel_1.default.findOne({ email });
        if (!owner) {
            return res.status(404).json({ message: "Owner Not Found" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        owner.password = hashedPassword;
        yield owner.save();
        res.status(204).json({ message: "password changed successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const ForgotPasswordOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const owner = yield ownerRepositary_1.default.findOwner(email);
        if (!owner) {
            return res.status(404).json({ message: "owner not found" });
        }
        const otp = generateOTP().toString();
        nodemailer_1.default.sendOTPByEmail(email, otp);
        const token = jwtOwner_1.default.generateTokens(otp);
        res.cookie("forgotOtpp", token);
        res.status(200).json({ message: "otp send successfully" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const verifyForgotOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        console.log(otp);
        const token = req.cookies.forgotOtpp;
        console.log(token);
        const jwtfogot = jsonwebtoken_1.default.verify(token, "Owner@123");
        console.log(jwtfogot);
        if (typeof jwtfogot === "string") {
            res
                .status(400)
                .json({ status: 400, message: "invalid or expired token" });
            return;
        }
        if (otp === jwtfogot.id) {
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
const addTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield ownerService_1.default.createTurf(req, res);
    }
    catch (error) {
        console.error("Error adding turf:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getOwnerTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.id;
        const turfs = yield turfModel_1.default.find({ turfOwner: ownerId });
        res.status(200).json(turfs);
    }
    catch (error) {
        console.error("Error retrieving owner's turfs:", error);
        res.status(500).json({ message: "Server error" });
    }
});
const getOwnerTurfById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turfId = req.params.id;
        const turf = yield turfModel_1.default.findById(turfId);
        if (!turf) {
            return res.status(404).json({ message: "Turf not found" });
        }
        res.status(200).json(turf);
    }
    catch (error) {
        console.error("Error retrieving turf:", error);
        res.status(500).json({ message: "Server error" });
    }
});
const editTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updateTurfData = req.body;
    try {
        const updatedTurf = yield ownerService_1.default.editTurf(id, updateTurfData);
        res.json(updatedTurf);
    }
    catch (error) {
        console.error("Error editing turf:", error);
        res.status(500).json({ message: "Server error" });
    }
});
const deleteTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield ownerService_1.default.turfDelete(id);
        res.status(200).json({ message: 'Turf Deleted Successfully' });
    }
    catch (error) {
        console.log('Error Deleting TUrf');
        res.status(500).json({ message: 'Server Error' });
    }
});
const getBookingsForTurf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const turfId = req.params.turfId;
        console.log(turfId);
        const bookings = yield bookingModel_1.default.find({ turfId: turfId });
        res.json(bookings);
    }
    catch (error) {
        console.error("Error fetching turf bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const ownerDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('started');
        const ownerId = req.id;
        console.log(ownerId, 'owenrid');
        if (!ownerId) {
            return res.status(400).json({ error: 'User ID is missing' });
        }
        const owner = yield ownerService_1.default.getOwnerDetails(ownerId);
        res.status(200).json(owner);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
const editOwnerDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.id;
        const { formData } = req.body;
        if (!ownerId) {
            return res.status(400).json({ error: 'Owner ID is missing' });
        }
        const updateOwner = yield ownerService_1.default.editDetails(ownerId, req.body);
        res.status(200).json(updateOwner);
    }
    catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('hello');
        const { newPassword } = req.body;
        console.log(newPassword);
        const ownerId = req.id;
        console.log(ownerId);
        if (!ownerId) {
            res.status(400).json({ error: 'Owner ID is missing' });
            return;
        }
        yield ownerService_1.default.resetPassword(ownerId, newPassword);
        res.status(200).json({ message: 'password reset succesffully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { turfId, bookingId } = req.body;
        console.log(turfId, bookingId);
        const cancelBooking = yield ownerService_1.default.ownerCancelBooking(turfId, bookingId);
        res.status(200).json(cancelBooking);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.id;
        if (ownerId) {
            const dashboardData = yield ownerService_1.default.getDashboardData(ownerId);
            res.json(dashboardData);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.default = {
    signup,
    verifyOtp,
    resendOtp,
    ownerLogin,
    addTurf,
    passwordForgot,
    ForgotPasswordOtp,
    verifyForgotOtp,
    getOwnerTurf,
    editTurf,
    getOwnerTurfById,
    deleteTurf,
    getBookingsForTurf,
    ownerDetails,
    editOwnerDetails,
    changePassword,
    cancelBooking,
    getDashboardData
};
