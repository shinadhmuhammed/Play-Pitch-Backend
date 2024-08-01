import { Request, Response } from "express";
import ownerRepositary from "../DataAccess/Repositary/ownerRepositary";
import ownerService from "../../Business/services/ownerService";
import jwtOwner from "../../FrameWorks/Middlewares/jwt/jwtOwner";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Owner, { OwnerModel } from "../DataAccess/Models/ownerModel";
import Turf from "../DataAccess/Models/turfModel";
import nodemailer from "../../Business/utils/nodemailer";
import TurfBooking from "../DataAccess/Models/bookingModel";


interface Ownersignup {
  _id:string;
  email: string;
  phone: string;
  password: string;
  otp?: string;
 
}

interface submitResponse {
  status: number;
  message: string;
  token?: string;
  turfAdded?: boolean; 
}


const signup = async (
  req: Request<{}, {}, Ownersignup>,
  res: Response<submitResponse>
) => {
  try {
    const { email, phone, password } = req.body;

    const otp = generateOTP().toString();
    await nodemailer.sendOTPByEmail(email, otp);
    const token = jwtOwner.generateTokens(otp);
    res.cookie("otp", token, { 
      expires: new Date(Date.now() + 180000), 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });
    
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
    const { otp, email, password, phone } = req.body;
    const token = req.cookies.otp;
    const jwtOtp: JwtPayload | string = jwt.verify(token, "Owner@123");
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
      const newOwner = await ownerService.createNewOwner(req.body);
    } else {
      res.status(400).json({ status: 400, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};

const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const gotp = generateOTP().toString();
    await nodemailer.sendOTPByEmail(email, gotp);
    const token = jwtOwner.generateTokens(gotp);
    res.cookie("otp", token, { 
      expires: new Date(Date.now() + 180000), 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none' 
    });
    
    res.status(200).json({ status: 200, message: "otp resend succesfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const ownerLogin = async (
  req: Request<{}, {}, Ownersignup>,
  res: Response<submitResponse>
) => {
  try {
    const { email, password } = req.body;
    const owner:OwnerModel = await ownerRepositary.findOwner(email) as OwnerModel
    if (!owner) {
      return res.status(404).json({ status: 404, message: "Owner not found" });
    }

    const isPasswordValid = await ownerService.confirmPassword(
      password,
      owner.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ status: 401, message: "Invalid password" });
    }

    const role = owner.role || 'owner';
    const token = jwtOwner.generateTokens(owner._id.toString(), role);
    const turf = await Turf.findOne({ turfOwner: owner._id });
    const turfAdded = !!turf;

    res.status(200).json({ status: 200, message: "Login successful", token, turfAdded });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error" });
  }
};



const passwordForgot = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "Owner Not Found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    owner.password = hashedPassword;
    await owner.save();
    res.status(204).json({ message: "password changed successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const owner = await ownerRepositary.findOwner(email);
    if (!owner) {
      return res.status(404).json({ message: "owner not found" });
    }
    const otp = generateOTP().toString();
    nodemailer.sendOTPByEmail(email, otp);
    const token = jwtOwner.generateTokens(otp);
    res.cookie("forgotOtpp", token);
    res.status(200).json({ message: "otp send successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyForgotOtp = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    console.log(otp);
    const token = req.cookies.forgotOtpp;
    console.log(token);
    const jwtfogot: JwtPayload | string = jwt.verify(token, "Owner@123");
    console.log(jwtfogot);

    if (typeof jwtfogot === "string") {
      res
        .status(400)
        .json({ status: 400, message: "invalid or expired token" });
      return;
    }
    if (otp === jwtfogot.id) {
      res
        .status(200)
        .json({ status: 200, message: "otp verified successfully" });
    } else {
      return res.status(400).json({ status: 400, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "internal server error" });
  }
};



interface CustomRequest extends Request {
  id?: string;
}

const addTurf = async (req: CustomRequest, res: Response) => {
  try {
    await ownerService.createTurf(req, res); 
  } catch (error) {
    console.error("Error adding turf:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


interface CustomRequest extends Request {
  id?: string; 
}

const getOwnerTurf = async (req: CustomRequest, res: Response) => {
  try {
    const ownerId = req.id;
    const turfs = await Turf.find({ turfOwner: ownerId });
    res.status(200).json(turfs);
  } catch (error) {
    console.error("Error retrieving owner's turfs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOwnerTurfById = async (req:Request, res:Response) => {
  try {
    const turfId = req.params.id;
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({ message: "Turf not found" });
    }
    res.status(200).json(turf);
  } catch (error) {
    console.error("Error retrieving turf:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const editTurf=async(req:Request,res:Response)=>{
  const {id}=req.params
  const updateTurfData=req.body
  try {
    const updatedTurf=await ownerService.editTurf(id,updateTurfData)
    res.json(updatedTurf)
    
  } catch (error) {
    console.error("Error editing turf:", error);
    res.status(500).json({ message: "Server error" });
  }
}


const deleteTurf=async(req:Request,res:Response)=>{
  const {id}=req.params
  try {
    const deleted=await ownerService.turfDelete(id)
    res.status(200).json({message:'Turf Deleted Successfully'})
  } catch (error) {
    console.log('Error Deleting TUrf')
    res.status(500).json({message:'Server Error'})
  }
}


const getBookingsForTurf = async (req: Request, res: Response) => {
  try {
    const turfId = req.params.turfId; 
    console.log(turfId)
    const bookings = await TurfBooking.find({ turfId: turfId });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching turf bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}






const ownerDetails=async(req:CustomRequest,res:Response)=>{
  try {
    console.log('started')
    const ownerId=req.id
    console.log(ownerId,'owenrid')
    if (!ownerId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }
    const owner=await ownerService.getOwnerDetails(ownerId)
    res.status(200).json(owner)
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

const editOwnerDetails=async(req:CustomRequest,res:Response)=>{
  try {
    const ownerId=req.id
    const {formData}=req.body
    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is missing' });
    }
    const updateOwner=await ownerService.editDetails(ownerId,req.body)
    res.status(200).json(updateOwner)

  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const changePassword=async(req:CustomRequest,res:Response)=>{
  try {
    console.log('hello')
    const {newPassword}=req.body
    console.log(newPassword)
    const ownerId=req.id
    console.log(ownerId)
    if (!ownerId) {
      res.status(400).json({ error: 'Owner ID is missing' });
      return;
    }
    await ownerService.resetPassword(ownerId,newPassword)
    res.status(200).json({message:'password reset succesffully'})
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}


const cancelBooking=async(req:Request,res:Response)=>{
  try {
      const {turfId,bookingId}=req.body
      console.log(turfId,bookingId)
      const cancelBooking=await ownerService.ownerCancelBooking(turfId,bookingId)
      res.status(200).json(cancelBooking)
  } catch (error) {
      console.log(error)
      res.status(500).json({message:"Internal Server Error"})
  }
}


const getDashboardData=async(req:CustomRequest,res:Response)=>{
  try {
    const ownerId=req.id
    if(ownerId){
    const dashboardData=await ownerService.getDashboardData(ownerId)
    res.json(dashboardData)
  }
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"Internal Server Error"})
  }
}






export default {
  signup,
  verifyOtp,
  resendOtp,
  ownerLogin,
  addTurf,
  passwordForgot,
  ForgotPasswordOtp,
  verifyForgotOtp,
  getOwnerTurf,
  editTurf,
  getOwnerTurfById,
  deleteTurf,
  getBookingsForTurf,
  ownerDetails,
  editOwnerDetails,
  changePassword,
  cancelBooking,
  getDashboardData
};
