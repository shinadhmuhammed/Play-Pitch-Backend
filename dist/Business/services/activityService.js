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
const UserModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/UserModel"));
const activityModel_1 = __importDefault(require("../../Adapters/DataAccess/Models/activityModel"));
const userRepositary_1 = __importDefault(require("../../Adapters/DataAccess/Repositary/userRepositary"));
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
        time: bookingDetails.Time,
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
const userActivities = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield activityModel_1.default.find({ userId });
        return activities;
    }
    catch (error) {
        throw error;
    }
});
const profilePhoto = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.default.findById(userId);
        return user;
    }
    catch (error) {
        throw error;
    }
});
exports.default = {
    createActivity,
    getActivity,
    getActivityById,
    activityRequest,
    declinedRequest,
    acceptedRequest,
    addedUserId,
    editActivites,
    userActivities,
    profilePhoto
};
