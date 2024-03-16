import { Request, Response } from "express";
import ownerRepositary from "../DataAccess/Repositary/ownerRepositary";
import ownerService from "../../Business/services/ownerService";
import Owner from "../DataAccess/Models/Turfowner";
import sendOTPByEmail, { generateOtp } from "../../Business/utils/nodemailer";

interface Ownersignup {
  email: string;
  phone: string;
  password: string;
  otp?: string;
}

interface submitResponse {
  status: number;
  message: string;
}

const signup = async (
  req: Request<{}, {}, Ownersignup>,
  res: Response<submitResponse>
) => {
  try {
    const { email, phone, password } = req.body;
    console.log(req.body);
    const otp = generateOTP().toString();
    await ownerRepositary.saveOtp(email, otp);
    await sendOTPByEmail(email, otp);

    if (!password) {
      return res
        .status(400)
        .json({ status: 400, message: "Password is required" });
    }

    const existingOwner = await ownerRepositary.findOwner(email);
    if (existingOwner) {
      return res
        .status(400)
        .json({ status: 400, message: "Email or phone already exists" });
    }

    const hashedPassword = await ownerService.passwordBcrypt(password);

    const newOwner = new Owner({
      email,
      phone,
      password: hashedPassword,
      otp: otp,
    });
    await newOwner.save();

    res
      .status(201)
      .json({ status: 201, message: "Owner registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    console.log(email,otp,'helloooooooooooooooooooooo')
    const owner = await Owner.findOne({ email });

    if (!owner) {
      return res.status(404).json({ status: 404, message: "Owner not found" });
    }

    if (owner.otp !== otp) {
      return res.status(400).json({ status: 400, message: "Invalid OTP" });
    }
    owner.otp = undefined;
    await owner.save();

    return res
      .status(200)
      .json({ status: 200, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};

// const resendOtp=async( req: Request,
//   res: Response)=>{
// try {
//     const {otp}=req.body
//     console.log(otp,'otpppp')
//     await sendOTPByEmail(req.Owner.email,otp)
// } catch (error) {
//   console.log(error)
// }
// }

export default { signup, verifyOtp };
