"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const turfSchema = new mongoose_1.default.Schema({
    turfName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    aboutVenue: {
        type: String,
        required: true
    },
    openingTime: {
        type: String,
        required: true
    },
    closingTime: {
        type: String,
        required: true
    },
    facilities: {
        type: String,
        required: true
    },
    price: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true
    },
    courtType: [{
            type: String,
            enum: ['5-aside', '6-aside', '7-aside', '8-aside', '10-aside', '11-aside'],
            required: true
        }],
    latitude: {
        type: Number,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    images: [{ type: String }],
    turfOwner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDeclined: {
        type: Boolean,
        default: false
    },
});
const Turf = mongoose_1.default.model('Turf', turfSchema);
exports.default = Turf;
