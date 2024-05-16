"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OwnerSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
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
    ]
});
const Owner = mongoose_1.default.model('ownerModel', OwnerSchema);
exports.default = Owner;
