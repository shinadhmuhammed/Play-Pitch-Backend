"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSchema = new mongoose_1.default.Schema({
    senderName: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timeStamp: {
        type: Date,
        required: true
    },
    activityId: {
        type: String,
        required: true
    }
});
const Chat = mongoose_1.default.model('Chat', chatSchema);
exports.default = Chat;
