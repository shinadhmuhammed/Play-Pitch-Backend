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
const adminService_1 = __importDefault(require("../../Business/services/adminService"));
const adminRepositary_1 = __importDefault(require("../DataAccess/Repositary/adminRepositary"));
const jwtAdmin_1 = __importDefault(require("../../FrameWorks/Middlewares/jwt/jwtAdmin"));
const nodemailer_1 = __importDefault(require("../../Business/utils/nodemailer"));
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const admin = yield adminService_1.default.adminLogin(email, password);
        if (admin) {
            const role = admin.role || "admin";
            const token = jwtAdmin_1.default.generateToken(admin._id.toString());
            res.status(200).json({ message: "Login successful", token });
        }
        else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield adminRepositary_1.default.getusers();
        res.status(200).json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const blockAndUnblock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, isBlocked } = req.body;
        console.log(req.body);
        const blockunblock = yield adminService_1.default.blockunblock(email, isBlocked);
        if (blockunblock) {
            res.status(201).json({ status: 201 });
        }
        else {
            res.status(404).json({ status: 404 });
        }
    }
    catch (error) {
        console.log("error in blocking the user in admin controller");
    }
});
const venueRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venues = yield adminService_1.default.getAllVenues();
        res.status(200).json(venues);
    }
    catch (error) {
        res.status(404).json({ message: "Failed to fetch venues" });
    }
});
const venueAccepts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { turfId, turfOwnerEmail } = req.body;
    console.log(turfId, turfOwnerEmail);
    try {
        const updatedTurf = yield adminService_1.default.acceptVenueRequests(turfId);
        const message = `Your turf with ID ${turfId} has been accepted.`;
        const subject = "Turf Accepted Notification";
        yield nodemailer_1.default.sendEmailNotification(turfOwnerEmail, message, subject);
        res.status(200).json({ message: "Turf Added Successfully", updatedTurf });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const venueDecline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { turfId, turfOwnerEmail } = req.body;
    console.log(turfId, turfOwnerEmail, "declineeeeeeeeeee");
    try {
        const message = `Your turf with ID ${turfId} has been declined.`;
        const subject = "Turf Declined Notification";
        yield nodemailer_1.default.sendEmailNotification(turfOwnerEmail, message, subject);
        const updatedTurf = yield adminService_1.default.declineVenueRequests(turfId);
        res
            .status(200)
            .json({ message: "Turf Declined Successfully", updatedTurf });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getVenueById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venueId = req.params.venueId;
        const VenueById = yield adminService_1.default.VenueById(venueId);
        res.status(200).json(VenueById);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const adminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dashboard = yield adminService_1.default.getDashboard();
        res.status(200).json(dashboard);
    }
    catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
});
exports.default = {
    adminLogin,
    getUsers,
    blockAndUnblock,
    venueRequests,
    venueAccepts,
    venueDecline,
    getVenueById,
    adminDashboard,
};
