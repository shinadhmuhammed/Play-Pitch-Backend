import { Request, Response } from "express";
import ownerRepositary from "../DataAccess/Repositary/ownerRepositary";
import ownerService from "../../Business/services/ownerService";
import Owner from "../DataAccess/Models/Turfowner";
import sendOTPByEmail, { generateOtp } from "../../Business/utils/nodemailer";
import jwtUser from "../../FrameWorks/Middlewares/jwtUser";
import Turf from "../DataAccess/Models/turfModel";


interface Ownersignup {
  email: string;
  phone: string;
  password: string;
  otp?: string;
}

interface submitResponse {
  status: number;
  message: string;
  token?:string;
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


const resendOtp=async( req: Request,
  res: Response)=>{
try {
    const {email}=req.body
    console.log(email,'otpppp')
    const gotp=generateOTP().toString()
    await ownerRepositary.saveOtp(email, gotp);
    await sendOTPByEmail(email,gotp)
    res.status(200).json({status:200,message:'otp resend succesfully'})
} catch (error) {
  console.log(error)
  res.status(500).json({ status: 500, message: "Internal server error" });
}
}


const ownerLogin=async( req: Request<{}, {}, Ownersignup>,
  res: Response<submitResponse>)=>{
      try {
            const{email,password}=req.body
            const owner=await ownerRepositary.findOwner(email)
            if (!owner) {
              return res.status(404).json({ status: 404, message: "Owner not found" });
          }
  
          const isPasswordValid = await ownerService.confirmPassword(password,owner.password);
  
          if (!isPasswordValid) {
              return res.status(401).json({ status: 401, message: "Invalid password" });
          }

          const token=jwtUser.generateToken(owner.id)
          
          res.status(200).json({ status: 200, message: "Login successful",token });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ status: 500, message: "Internal Server Error" });
      }
  }
    
  

  const addTurf = async (req:Request, res:Response) => {
        try {
            const { turfName, address, city, aboutVenue, facilities, openingTime, closingTime} = req.body;
            console.log(req.body)

            // Create a new instance of Turf model
            const newTurf = new Turf({
                turfName,
                address,
                city,
                aboutVenue,
                facilities,
                openingTime,
                closingTime,
            });

            // Save the turf to the database
            await newTurf.save();

            // Respond with success message
            res.status(201).json({ message: 'Turf added successfully' });
        } catch (error) {
            console.error('Error adding turf:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }





export default { signup, verifyOtp,resendOtp,ownerLogin,addTurf };
