import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { GMAIL_USER, GMAIL_PASS } = process.env;

const sendOTPByEmail = async (email: string, otp: string) => {
  try {
    console.log(email, otp, "********");
    const mailTransporter = nodemailer.createTransport({
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

    const send = await mailTransporter.sendMail(mailDetails);
    if (send) console.log("Otp send successfully");
    else console.log("Error in sending otp");
  } catch (error) {
    console.log(error, "Error in sending otp");
  }
};

const sendEmailNotification = async (email: string, message: string, subject: string) => {
  try {
    const mailTransporter = nodemailer.createTransport({
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

    const send = await mailTransporter.sendMail(mailDetails);
    if (send) console.log("Email sent successfully");
    else console.log("Error in sending email");
  } catch (error) {
    console.log(error, "Error in sending email");
  }
};

export default { sendOTPByEmail, sendEmailNotification };
