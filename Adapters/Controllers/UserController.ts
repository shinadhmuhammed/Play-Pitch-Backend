import { Request, Response } from "express";
import JwtUser from "../../FrameWorks/Middlewares/jwtUser";
import { getSavedOtp, verifyLogin,checkUser } from "../../Business/services/userService";
import createNewUser from "../../Business/services/userService";
import sendOTPByEmail from "../../Business/utils/nodemailer";
import userRepositary from "../DataAccess/Repositary/userRepositary";
import User from "../DataAccess/Models/UserModel";
import bcrypt from 'bcrypt'

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
    await sendOTPByEmail(req.body.email, otp);
    await userRepositary.saveOtpInDatabase(req.body.userId, otp);
    console.log(otp, "heeeeyy");
    const newUser = await createNewUser(req.body);
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
    console.log(req.body, "hello");
    const verifyUser = await verifyLogin(req.body);

    if (verifyUser && typeof verifyUser !== 'boolean') { 
      const token = JwtUser.generateToken(verifyUser._id.toString());
      console.log(token,'token')
      res.status(200).json({ status: 200, message: "Login successful", token });
    } else {
      res.status(401).json({ status: 401, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};


interface verifyOtpBody {
  status: number;
  userId: string;
  otp: string;
  createdAt: Date;
  purpose?: string;
}

const verifyOtp = async (
  req: Request<{}, {}, verifyOtpBody>,
  res: Response<any, Record<string, any>>
) => {
  try {
    const savedOtp = await getSavedOtp(req.body.userId);
    console.log(savedOtp, "saved OTp");
    if (savedOtp) {
      const currentDateTime = new Date();
      const expiryTime = new Date(savedOtp.createAt);
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);

      if (currentDateTime <= expiryTime) {
        if (req.body.otp === savedOtp.otp) {
          res
            .status(200)
            .json({ status: 200, message: "OTP verified successfully" });
        } else {
          res.status(400).json({ status: 400, message: "Invalid OTP" });
        }
      } else {
        res.status(400).json({ status: 400, message: "OTP expired" });
      }
    } else {
      res
        .status(404)
        .json({ status: 404, message: "No OTP found for the user" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

const resendOtp = async (
  req: Request<{}, {}, { userId: string; email: string }>,
  res: Response
) => {
  try {
    const { userId, email } = req.body;
    const otp = generateOtp();
    await sendOTPByEmail(email, otp);
    await userRepositary.saveOtpInDatabase(userId, otp);
    res.status(200).json({ status: 200, message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};





const forgotPassword=async(req:Request,res:Response)=>{
  try {
    const { email, otp, newPassword,confirmPassword } = req.body;
    console.log(email,otp,newPassword,confirmPassword,'haaaaaaaaaaai,hellllllllllllllllll')

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (otp !== user.otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
  }

  
 

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}






const sendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOtp();
        user.otp = otp; 
        await user.save();
        sendOTPByEmail(email, otp);

        
        setTimeout(async () => {
            user.otp = null;
            await user.save();
        }, 3 * 60 * 1000); 

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}




export default {
  signup,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  sendOtp
};
