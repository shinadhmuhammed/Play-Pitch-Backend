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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { GMAIL_USER, GMAIL_PASS } = process.env;
const sendOTPByEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(email, otp, "********");
        const mailTransporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS,
            },
        });
        const msg = `Dear user  OTP to reset your  login  is  ${otp}.Do not share this to any one`;
        const mailDetails = {
            from: GMAIL_USER,
            to: email,
            subject: "Turf Booking",
            text: msg,
        };
        const send = yield mailTransporter.sendMail(mailDetails);
        if (send)
            console.log("Otp send successfully");
        else
            console.log("Error in sending otp");
    }
    catch (error) {
        console.log(error, "Error in sending otp");
    }
});
const sendEmailNotification = (email, message, subject) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mailTransporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_PASS,
            },
        });
        const mailDetails = {
            from: GMAIL_USER,
            to: email,
            subject: subject,
            text: message,
        };
        const send = yield mailTransporter.sendMail(mailDetails);
        if (send)
            console.log("Email sent successfully");
        else
            console.log("Error in sending email");
    }
    catch (error) {
        console.log(error, "Error in sending email");
    }
});
exports.default = { sendOTPByEmail, sendEmailNotification };
