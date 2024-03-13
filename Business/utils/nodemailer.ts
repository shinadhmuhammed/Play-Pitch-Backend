
import nodemailer from "nodemailer";

const sendOTPByEmail = async (email: string, otp: string) => {
  try {
    console.log(email, otp, "********");
    const mailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "muhammedshinadhmk@gmail.com",
        pass: "nkqk iaww dqvp upeh",
      },
    });

    const msg = `Dear user  OTP to reset your  login  is  ${otp}.Do not share this to any one`;

    const mailDetails = {
      from: "muhammedshinadhmk@gmail.com",
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
export default sendOTPByEmail;