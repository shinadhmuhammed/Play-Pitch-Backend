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
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const TurfBookingSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    turfId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Turf',
        required: true
    },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    selectedSlot: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    Time: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        enum: ['wallet', 'online'],
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'completed', 'cancelled'],
        default: 'confirmed'
    },
});
const TurfBooking = mongoose_1.default.model('TurfBooking', TurfBookingSchema);
const updateBookingStatuses = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expiredBookings = yield TurfBooking.find({
            bookingStatus: 'confirmed',
            date: { $lt: new Date() },
        });
        for (const booking of expiredBookings) {
            booking.bookingStatus = 'completed';
            yield booking.save();
        }
        console.log('Booking statuses updated successfully');
    }
    catch (error) {
        console.error('Error updating booking statuses:', error);
    }
});
node_cron_1.default.schedule('0 * * * *', updateBookingStatuses);
exports.default = TurfBooking;
