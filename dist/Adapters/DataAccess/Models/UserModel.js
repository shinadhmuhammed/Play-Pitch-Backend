"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: String,
    password: {
        type: String,
        required: true
    },
    profilePhotoUrl: { type: String },
    isBlocked: {
        type: Boolean,
        default: false
    },
    wallet: {
        default: 0,
        type: Number
    },
    walletStatements: [
        {
            date: Date,
            walletType: String,
            amount: Number,
            turfName: String,
            transactionType: {
                type: String,
                enum: ['debit', 'credit']
            }
        }
    ],
});
const User = mongoose_1.default.model('userModel', UserSchema);
exports.default = User;
