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
const activityService_1 = __importDefault(require("../../Business/services/activityService"));
const userService_1 = __importDefault(require("../../Business/services/userService"));
const activityModel_1 = __importDefault(require("../DataAccess/Models/activityModel"));
const createActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { formData, bookingDetails, turfDetails, user } = req.body;
        const newActivity = yield activityService_1.default.createActivity(formData, bookingDetails, turfDetails, user);
        res.status(201).json(newActivity);
    }
    catch (error) {
        console.error(error);
        if (error.message.includes("Activity with the same booking ID already exists")) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Activity alreay created" });
        }
    }
});
const getActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const activity = yield activityService_1.default.getActivity();
        res.status(201).json({ userId, activity });
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getActivityById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const activity = yield activityService_1.default.getActivityById(id);
        res.json(activity);
    }
    catch (error) {
        console.error("Error fetching activity details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const activityRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const activityId = req.params.id;
    const { username, phone } = req.body;
    const userId = req.id;
    try {
        if (userId) {
            const activity = yield activityService_1.default.activityRequest(activityId, userId, username, phone);
            res.status(201).json(activity);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const getRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.id;
        const activity = yield activityModel_1.default.findOne({ userId });
        res.status(201).json(activity);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error" });
    }
});
const acceptJoinRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { activityId, joinRequestId } = req.params;
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        const joinRequest = activity.joinRequests.find((request) => { var _a; return ((_a = request === null || request === void 0 ? void 0 : request._id) === null || _a === void 0 ? void 0 : _a.toString()) === joinRequestId; });
        if (!joinRequest) {
            return res.status(404).json({ message: "Join request not found" });
        }
        joinRequest.status = "accepted";
        if (joinRequest.user) {
            activity.participants.push(joinRequest.user);
        }
        else {
            console.error("User not found for join request:", joinRequestId);
        }
        yield activity.save();
        res.status(200).json({ message: "Join request accepted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error" });
    }
});
const declineJoinRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { activityId, joinRequestId } = req.params;
    try {
        const activity = yield activityModel_1.default.findById(activityId);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        const joinRequest = activity.joinRequests.find((request) => { var _a; return ((_a = request === null || request === void 0 ? void 0 : request._id) === null || _a === void 0 ? void 0 : _a.toString()) === joinRequestId; });
        if (!joinRequest) {
            return res.status(404).json({ message: "Join request not found" });
        }
        joinRequest.status = "rejected";
        yield activity.save();
        res.status(200).json({ message: "Join request declined successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server Error" });
    }
});
const acceptedUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activity } = req.body;
        const participantDetails = yield activityService_1.default.addedUserId(activity);
        res.status(200).json(participantDetails);
    }
    catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const activity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activityId } = req.query;
        const activity = yield activityModel_1.default.findById(activityId);
        res.status(200).json(activity);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
const editActivites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { activityName, maxPlayers, description } = req.body;
    try {
        const editActivity = yield activityService_1.default.editActivites(id, activityName, maxPlayers, description);
        res
            .status(200)
            .json({ message: "Activity updated successfully", editActivity });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const userActivity = yield activityService_1.default.userActivities(userId);
        res.json({ success: true, userActivity });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const searchActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        if (typeof query !== "string") {
            throw new Error("Query parameter must be a string");
        }
        const activity = yield userService_1.default.activityResults(query);
        res.json({ success: true, activity });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('started');
        const { userId } = req.body;
        console.log(userId, 'klklklklklkl');
        const user = yield activityService_1.default.profilePhoto(userId);
        res.status(200).json(user);
        console.log(user, 'klklkl');
    }
    catch (error) {
    }
});
exports.default = {
    createActivity,
    getActivity,
    getActivityById,
    getRequest,
    acceptJoinRequest,
    declineJoinRequest,
    acceptedUserId,
    activityRequest,
    activity,
    editActivites,
    getActivities,
    searchActivity,
    getProfilePhoto
};
