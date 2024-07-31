import { Request, Response } from "express";
import JwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import userRepositary from "../DataAccess/Repositary/userRepositary";
import User from "../DataAccess/Models/UserModel";
import bcrypt from "bcrypt";
import jwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import nodemailer from "../../Business/utils/nodemailer";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import userService from "../../Business/services/userService";
dotenv.config();
import { UploadApiResponse } from "cloudinary";
import { cloudinaryInstance } from "../../FrameWorks/Middlewares/cloudinary";
import Turf from "../DataAccess/Models/turfModel";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    await nodemailer.sendOTPByEmail(req.body.email, otp);
    const token = jwtUser.generateToken(otp);
    res.cookie("otp", token, { expires: new Date(Date.now() + 180000) });
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
    const verifyUser = await userService.verifyLogin(req.body);
    if (verifyUser && typeof verifyUser !== "boolean") {
      if (verifyUser.isBlocked) {
        res.status(403).json({ status: 403, message: "user is blocked" });
      } else {
        const role = verifyUser.role || "user";
        const token = JwtUser.generateToken(verifyUser._id.toString(), role);
        res
          .status(200)
          .json({ status: 200, message: "Login successful", token });
      }
    } else {
      res
        .status(401)
        .json({ status: 401, message: "Invalid Email or Password" });
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
    const { otp } = req.body;

    const token = req.cookies.otp;
    console.log("Received OTP token:", token);

    const secretKey = process.env.USER_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Secret key is not defined in environment variables");
    }

    const jwtOtp: JwtPayload | string = jwt.verify(token, secretKey);

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

      const newUser = await userService.createNewUser(req.body);
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
    await nodemailer.sendOTPByEmail(email, otp);
    const token = jwtUser.generateToken(otp);
    res.cookie("otp", token, { expires: new Date(Date.now() + 180000) });
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
    nodemailer.sendOTPByEmail(email, otp);
    const token = jwtUser.generateToken(otp);
    res.cookie("forgotOtp", token,{httpOnly: true, secure: true, sameSite: 'none', domain: '.play-pitch.vercel.app'});
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyForgot = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const token = req.cookies.forgotOtp;

    const secretKey = process.env.USER_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Secret key is not defined in environment variables");
    }

    const jwtfogotOtp: JwtPayload | string = jwt.verify(token, secretKey);

    if (typeof jwtfogotOtp === "string") {
      res
        .status(400)
        .json({ status: 400, message: "invalid or expired token" });
      return;
    }

    if (otp === jwtfogotOtp.id) {
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

const getTurf = async (req: Request, res: Response) => {
  try {
    const turf = await userRepositary.turfGet();
    res.status(200).json(turf);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};  



const googleAuth = async (req: Request, res: Response) => {
  const { credential } = req.body;
  try {
    const { token, user } = await userService.authenticateWithGoogle(
      credential
    );
    return res.json({ token, user });
  } catch (error) {
    console.error("Google authentication failed:", error);
    return res.status(401).json({ error: "Google authentication failed" });
  }
};

const getSingleTurf = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const singleTurf = await userService.singTurf(id);
    res.status(200).json(singleTurf);
  } catch (error) {
    console.error("Error fetching turf:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTurfRating = async (req: Request, res: Response) => {
  try {
    const { turfId } = req.body;
    const getTurfs = await userService.getTurfRating(turfId);
    res.status(200).json(getTurfs);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

interface CustomRequest extends Request {
  id?: string;
  role?: string;
}

const getBooking = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const findBooking = await userService.bookingGet(userId);
    res.status(200).json(findBooking);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

const getBookingById = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const bookingId = req.params.bookingId;
    const BookingById = await userService.bookingGetById(userId, bookingId);
    res.status(200).json(BookingById);
  } catch (error) {
    console.log("error");
    res.status(500).json({ message: "internal server error" });
  }
};

const checkSlotAvailibility = async (req: Request, res: Response) => {
  try {
    const { turfDetail, selectedDate, selectedStartTime, selectedEndTime } =
      req.body;
    const turfId = turfDetail._id;
    const slot = await userService.slotavailability(
      turfId,
      selectedDate,
      selectedStartTime,
      selectedEndTime
    );
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const stripePayment = async (req: CustomRequest, res: Response) => {
  try {
    const {
      totalPrice,
      selectedDate,
      ownerId,
      selectedStartTime,
      selectedEndTime,
      turfDetail,
    } = req.body;

    if (!totalPrice || typeof totalPrice !== "number" || totalPrice <= 0) {
      return res.status(400).json({ message: "Invalid totalPrice" });
    }

    const sessionId = await userService.createStripeSession(
      totalPrice,
      selectedDate,
      ownerId,
      selectedStartTime,
      selectedEndTime,
      turfDetail
    );
    res.json({ id: sessionId });
  } catch (error) {
    console.error("Error occurred while processing payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const stripeBooking = async (req: CustomRequest, res: Response) => {
  try {
    const {
      selectedStartTime,
      turfId,
      date,
      selectedEndTime,
      totalPrice,
      ownerId,
    } = req.body;
    if (!req.id) {
      return res.status(400).json({ message: "User ID is missing" });
    }
    const userId: string = req.id;

    const createdBooking = await userService.createBookingAndAdjustWallet(
      userId,
      turfId,
      ownerId,
      date,
      selectedStartTime,
      selectedEndTime,
      totalPrice
    );
    res.status(201).json(createdBooking);
  } catch (error) {
    console.error("Error occurred while creating booking entry:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDetails = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }

    const user = await userService.getUserDetails(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userDetailsEdit = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const { formData } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is missing" });
    }
    const updateUser = await userService.editUserDetails(userId, req.body);
    res.status(200).json(updateUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req: CustomRequest, res: Response) => {
  try {
    const newPassword = req.body.password;
    const userId = req.id;

    if (!userId) {
      res.status(400).json({ error: "User ID is missing" });
      return;
    }
    await userService.resetPassword(userId, newPassword);
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const editUserDetails = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const { username, email, phone } = req.body;
    let profilePhotoUrl;
    if (req.file) {
      const result: UploadApiResponse =
        await cloudinaryInstance.uploader.upload(req.file.path);
      profilePhotoUrl = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, phone, profilePhotoUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User details updated successfully",
      profilePhotoUrl,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const booking = await userService.UserCancelBooking(id);

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const payWithWallet = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }
    const userIdString = String(userId);
    const {
      selectedStartTime,
      turfDetail,
      selectedDate,
      selectedEndTime,
      totalPrice,
      ownerId,
      paymentMethod,
    } = req.body;
    const user = await userRepositary.getUserById(userIdString);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.wallet < totalPrice) {
      return res
        .status(400)
        .json({ message: "Insufficient balance in the wallet" });
    }
    const bookingResult = await userService.bookWithWallet(
      userIdString,
      ownerId,
      selectedStartTime,
      turfDetail,
      selectedDate,
      selectedEndTime,
      totalPrice,
      paymentMethod
    );
    return res.status(200).json({ message: bookingResult.message });
  } catch (error) {
    console.error(
      "Error occurred while processing payment with wallet:",
      error
    );
    return res
      .status(500)
      .json({ message: "Failed to process payment with wallet" });
  }
};

interface Chat {
  sender: string;
  message: string;
  roomId: string;
  chatUser: string;
  timeStamp: Date;
}

const chatStoring = async (req: Request, res: Response) => {
  try {
    const { sender, message, roomId, chatUser } = req.body;
    const timeStamp = new Date();
    const chat: Chat = { sender, message, timeStamp, roomId, chatUser };
    const savedChatMessages = await userService.saveChatMessages(chat);
    res.status(200).json(savedChatMessages);
  } catch (error) {
    console.error("Error storing chat message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.query;
    const chatMessages = await userService.getChat(activityId);
    res.status(200).json(chatMessages);
  } catch (error) {
    console.log(error);
  }
};

const getChatUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const chatUser = await userService.chatUser(userId);
    res.status(200).json(chatUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const turfRating = async (req: CustomRequest, res: Response) => {
  try {
    const { message, rating, turfId, userName } = req.body;
    const userId = req.id;
    if (userId) {
      const saveRating = await userService.ratingSave(
        userId,
        turfId,
        message,
        rating,
        userName
      );

      res.status(200).json(saveRating);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

const getRating = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const ratings = await userService.getRating(userId);
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Internal server Error" });
  }
};

const getUserRating = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const users = await userService.usersRating(userId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server Error" });
  }
};

const getTurfAverageRating = async (req: Request, res: Response) => {
  try {
    const { turfId } = req.body;
    const ratings = await userService.getTurfRatings(turfId);

    if (ratings.length === 0) {
      res.status(404).json({ message: "No ratings found for this turf" });
      return;
    }

    const totalRating = ratings.reduce(
      (acc, curr) => acc + parseInt(curr.rating),
      0
    );
    const averageRating = totalRating / ratings.length;
    const maxRating = 5;
    const ratingOutOfFive = (averageRating / maxRating) * 5;
    res.status(200).json({ averageRating: ratingOutOfFive });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

const nearestTurf = async (req: Request, res: Response) => {
  const { latitude, longitude, query } = req.body;
  try {
    const nearbyTurfs = await Turf.find({
      latitude: { $gt: latitude - 0.1, $lt: latitude + 0.1 },
      longitude: { $gt: longitude - 0.1, $lt: longitude + 0.1 },
    });
    res.status(200).json({
      success: true,
      nearestTurf: nearbyTurfs[0],
    });
  } catch (error) {
    console.error("Error finding nearest turf:", error);
    res
      .status(500)
      .json({ success: false, error: "Error finding nearest turf" });
  }
};

const searchTurfName = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const searchResults = await userService.searchName(query);
    res.json(searchResults);
  } catch (error) {
    console.error("Error searching turf names:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTurfSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const suggestions = await userService.fetchTurfSuggestionsFromDatabase(
      query
    );
    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching turf search suggestions:", error);
    res.status(500).json({ error: "Internal server error" });
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
  verifyForgot,
  googleAuth,
  getSingleTurf,
  getTurfRating,
  getBooking,
  getBookingById,
  checkSlotAvailibility,
  stripePayment,
  stripeBooking,
  getDetails,
  userDetailsEdit,
  resetPassword,
  editUserDetails,
  cancelBooking,
  payWithWallet,
  chatStoring,
  getChatMessages,
  getChatUser,
  turfRating,
  getRating,
  getUserRating,
  getTurfAverageRating,
  nearestTurf,
  searchTurfName,
  getTurfSearchSuggestions,
};
