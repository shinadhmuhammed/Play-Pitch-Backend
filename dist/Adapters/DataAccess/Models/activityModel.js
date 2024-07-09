"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const activitySchema = new mongoose_1.default.Schema({
    activityName: {
        type: String,
        required: true
    },
    bookingId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'TurfBooking',
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    participants: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }],
    joinRequests: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            },
            username: String,
            phone: Number,
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            }
        }],
    turfId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Turf',
        required: true
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    turfName: {
        type: String,
        required: true
    },
    Profile: {
        type: String
    },
    slot: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed'],
        default: 'ongoing'
    }
});
const Activity = mongoose_1.default.model('activityModel', activitySchema);
exports.default = Activity;
