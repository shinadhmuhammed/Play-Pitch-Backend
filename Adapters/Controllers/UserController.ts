import { Request, Response } from "express";
import JwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import {
  getSavedOtp,
  verifyLogin,
  checkUser,
} from "../../Business/services/userService";
import createNewUser from "../../Business/services/userService";
import sendOTPByEmail from "../../Business/utils/nodemailer";
import userRepositary from "../DataAccess/Repositary/userRepositary";
import User from "../DataAccess/Models/UserModel";
import bcrypt from "bcrypt";
import jwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

try {
} catch (error) {}

interface ReqBody {
  userId: string;
  userName: string;
  email: string;
  phone: number;
  password: string;
  confirm: string;
  otp: string;
  createdAt: Date;
  isBlocked: boolean;
}

interface signupSubmitResponse {
  status: number;
  message: string;
}

const signup = async (
  req: Request<{}, {}, ReqBody>,
  res: Response<signupSubmitResponse>
) => {
  try {
    const otp = generateOtp();
    console.log(otp, "otpppppppppp");
    await sendOTPByEmail(req.body.email, otp);

    const token = jwtUser.generateToken(otp);
    console.log(token, "tokennnnnnnnnnnnnnsssssssss");
    res.cookie("otp", token);

    res.status(201).json({ status: 201, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

interface loginSubmitResponse {
  status: number;
  message: string;
  userData?: string;
  token?: string;
}

const login = async (
  req: Request<{}, {}, ReqBody>,
  res: Response<loginSubmitResponse>
) => {
  try {
    const verifyUser = await verifyLogin(req.body);
    if (verifyUser && typeof verifyUser !== "boolean") {
      if (verifyUser.isBlocked) {
        res.status(403).json({ status: 403, message: "user is blocked" });
      } else {
        const token = JwtUser.generateToken(verifyUser._id.toString());
        console.log(token, "tokennnnnnnnnnn");
        res
          .status(200)
          .json({ status: 200, message: "Login successful", token });
      }
    } else {
      res.status(401).json({ status: 401, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const verifyOtp = async (
  req: Request<{}, {}, ReqBody>,
  res: Response<any, Record<string, any>>
) => {
  try {
    console.log("Received OTP verification request");

    const { otp } = req.body;
    console.log(req.body, "req.bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");

    const token = req.cookies.otp;
    console.log("Received OTP token:", token);

    const jwtOtp: JwtPayload | string = jwt.verify(token, "Hello@123!");
    console.log(jwtOtp);

    if (typeof jwtOtp === "string") {
      res
        .status(400)
        .json({ status: 400, message: "Invalid or expired token" });
      return;
    }

    if (otp === jwtOtp.id) {
      res
        .status(200)
        .json({ status: 200, message: "OTP verified successfully" });

      const newUser = await createNewUser(req.body);
    } else {
      res.status(400).json({ status: 400, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const resendOtp = async (
  req: Request<{}, {}, { userId: string; email: string }>,
  res: Response
) => {
  try {
    const { email } = req.body;
    const otp = generateOtp();
    await sendOTPByEmail(email, otp);
    const token = jwtUser.generateToken(otp);
    res.cookie("otp", token);

    res.status(200).json({ status: 200, message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    await user.save();
    sendOTPByEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTurf = async (req: Request, res: Response) => {
  try {
    const turf = await userRepositary.turfGet();
    res.status(200).json(turf);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  sendOtp,
  getTurf,
};
