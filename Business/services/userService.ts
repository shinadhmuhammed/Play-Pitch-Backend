import bcrypt from "bcrypt";
import User from "../../Adapters/DataAccess/Models/UserModel";
import userRepositary from "../../Adapters/DataAccess/Repositary/userRepositary";
import { ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import Turf from "../../Adapters/DataAccess/Models/turfModel";
import TurfBooking from "../../Adapters/DataAccess/Models/bookingModel";
import Stripe from "stripe";
import dotenv from "dotenv";
import Owner from "../../Adapters/DataAccess/Models/ownerModel";
import Admin from "../../Adapters/DataAccess/Models/adminModel";
import Activity from "../../Adapters/DataAccess/Models/activityModel";
import { request } from "express";
dotenv.config();

interface ReqBody {
  userName: string;
  email: string;
  phone: number;
  password: string;
  confirm: string;
}

const createNewUser = async (user: ReqBody) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 5);
    user.password = hashedPassword;

    const existingUser = await userRepositary.findUser(user.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = new User(user);
    await newUser.save();
    return { message: "user created" };
  } catch (error) {
    console.log(error);
    return { message: "user not created" };
  }
};

type User = {
  role: string;
  _id: ObjectId;
  username?: string | null;
  email: string;
  phone?: number | null;
  password: string;
  isBlocked: boolean;
};

const verifyLogin = async (user: ReqBody): Promise<User | false> => {
  try {
    const userDetails = await userRepositary.findUser(user.email);
    if (userDetails !== undefined && userDetails !== null) {
      const passwordMatch = await bcrypt.compare(
        user.password,
        userDetails.password
      );
      if (passwordMatch) {
        const { _id, email, password, isBlocked } = userDetails;
        return { _id, email, password, isBlocked, role: "user" };
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

interface otp {
  userId: string;
  otp: string;
  createdAt: Date;
}

const checkUser = async (userId: string) => {
  try {
    const findUser = await userRepositary.findUser(userId);
    if (findUser !== undefined) {
      if (findUser !== null) {
        if (findUser.email) {
          return { message: "user Exists" };
        } else {
          return { message: "User Not Found" };
        }
      }
    }
    return { message: "User Not Found" };
  } catch (error) {
    console.log("error is happening for verifying");
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticateWithGoogle = async (credential: string) => {
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Google authentication failed: Payload is missing");
  }

  const userId = payload.sub;
  const email = payload.email;
  const name = payload.name;

  let user = await User.findOne({ googleId: userId });

  if (!user) {
    user = new User({
      googleId: userId,
      email,
      name,
      password: "defaultPassword",
    });
    await user.save();
  }
  const token = jwtUser.generateToken(user._id.toString(), "user");
  return { token, user };
};

const singTurf = async (id: string) => {
  try {
    const turf = await Turf.findById(id);
    if (!turf) {
      throw new Error("Turf not found");
    }
    return turf;
  } catch (error) {
    console.error("Error fetching turf:", error);
    throw new Error("Failed to fetch turf");
  }
};

const bookingGet = async (userId: any) => {
  try {
    const booking = await TurfBooking.find({ userId: userId });
    return booking;
  } catch (error) {
    console.log(error);
  }
};

const bookingGetById = async (userId: any, bookingId: any) => {
  try {
    const booking = await TurfBooking.findOne({
      userId: userId,
      _id: bookingId,
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    const user = await User.findById({ _id: userId });
    const turfDetails = await Turf.findOne({ _id: booking.turfId });
    return { booking, turfDetails, user };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const slotavailability = async (
  turfId: string,
  date: string,
  selectedStartTime: string,
  selectedEndTime: string
) => {
  try {
    const available = await userRepositary.slotBooking(
      turfId,
      date,
      selectedStartTime,
      selectedEndTime
    );
    return available;
  } catch (error) {
    console.log(error);
  }
};

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeSession = async (
  totalPrice: number,
  selectedDate: string,
  selectedStartTime: string,
  selectedEndTime: string,
  turfDetail: any
): Promise<string> => {
  const customer = await stripe.customers.create({
    name: "nabeel",
    email: "muhammedshinadh@gmail.com",
    address: {
      state: "kerala",
      line1: "123 kfaj kfdsj",
      postal_code: "672732",
      country: "US",
      city: "palakkad",
    },
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Turf Booking",
          },
          unit_amount: totalPrice * 100,
        },
        quantity: 1,
      },
    ],
    customer: customer.id,
    mode: "payment",
    success_url: `http://localhost:5173/booking-verification?turfId=${encodeURIComponent(
      turfDetail._id
    )}&date=${encodeURIComponent(
      selectedDate
    )}&selectedStartTime=${encodeURIComponent(
      selectedStartTime
    )}&selectedEndTime=${encodeURIComponent(
      selectedEndTime
    )}&paymentMethod=online&totalPrice=${encodeURIComponent(
      totalPrice.toString()
    )}`,
    cancel_url: "http://localhost:5173/booking-cancel",
  });
  return session.id;
};

const createBookingAndAdjustWallet = async (
  userId: string,
  turfId: string,
  date: Date,
  selectedStartTime: string,
  selectedEndTime: string,
  totalPrice: number
) => {
  try {
    const currentTime = new Date();
    const bookingData = {
      turfId: turfId,
      date: date,
      userId: userId,
      selectedSlot: `${selectedStartTime} - ${selectedEndTime}`,
      totalPrice: totalPrice,
      Time: currentTime,
      paymentMethod: "online",
    };
    const createdBooking = await TurfBooking.create(bookingData);

    // Fetch the turf document
    const turf = await Turf.findById(turfId);
    if (!turf) {
      throw new Error("Turf not found");
    }

    const ownerAmount = totalPrice * 0.9;
    const adminAmount = totalPrice * 0.1;

    const owner = await Owner.findOneAndUpdate(
      { _id: turf.turfOwner },
      {
        $inc: { wallet: ownerAmount },
        $push: {
          walletStatements: {
            date: currentTime,
            walletType: "wallet",
            amount: ownerAmount,
            turfName: turf.turfName,
            transactionType: "credit",
          },
        },
      },
      { new: true }
    );

    const adminEmail = "admin@gmail.com";

    const admin = await Admin.findOneAndUpdate(
      { email: adminEmail },
      {
        $inc: { wallet: adminAmount },
        $push: {
          walletStatements: {
            date: currentTime,
            walletType: "wallet",
            amount: adminAmount,
            turfName: turf.turfName,
            transactionType: "credit",
          },
        },
      },
      { new: true }
    );

    return createdBooking;
  } catch (error) {
    throw new Error("Failed to create booking and adjust wallet");
  }
};

const getUserDetails = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error("Error retrieving user details:", error);
    throw new Error("Failed to retrieve user details");
  }
};

const editUserDetails = async (userId: string, userData: any) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, {
      new: true,
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user details:", error);
    throw new Error("Failed to update user details");
  }
};

const resetPassword = async (userId: string, newPassword: string) => {
  try {
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    user.password = hashedPassword;
    await user.save();
  } catch (error) {
    throw new Error("Error resetting password");
  }
};

const UserCancelBooking = async (id: string) => {
  try {
    const cancellationTime = new Date();
    console.log(cancellationTime, "cancel time");
    const booking = await TurfBooking.findOneAndUpdate(
      { _id: id, bookingStatus: "confirmed" },
      { $set: { bookingStatus: "cancelled" } },
      { new: true }
    );

    let refundAmount = 0;
    if (booking) {
      const bookingDate = new Date(booking.date);
      const bookingTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
        parseInt(booking.selectedSlot.split(":")[0]),
        0,
        0
      );
      console.log(bookingTime, "bookingTime");
      const timeDifference = bookingTime.getTime() - cancellationTime.getTime();
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      console.log(hoursDifference, "hoursDifference");
      console.log(booking.totalPrice, "totalPrice");
      if (hoursDifference < 1) {
        refundAmount = 0;
      } else if (hoursDifference < 10) {
        refundAmount = booking.totalPrice / 2;
      } else {
        refundAmount = booking.totalPrice;
      }
    }
    console.log(refundAmount, "refundamount");

    const turf = await Turf.findById(booking?.turfId);
    console.log(turf);
    const user = await User.findById(booking?.userId);

    if (user) {
      user.wallet += refundAmount;
      console.log(user.wallet, "userwallet");
      const walletStatement = {
        date: new Date(),
        walletType: "refund",
        turfName: turf?.turfName,
        amount: refundAmount,
        transaction: "credit",
      };
      user.walletStatements.push(walletStatement);
      await user.save();

      return booking;
    }
  } catch (error) {
    console.log(error);
  }
};

const bookWithWallet = async (
  userId: string,
  selectedStartTime: string,
  turfId: string,
  date: string,
  selectedEndTime: string,
  totalPrice: number,
  paymentMethod: string
) => {
  try {
    const user = await userRepositary.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.wallet < totalPrice) {
      throw new Error("Insufficient balance in the wallet");
    }

    const updatedWalletAmount = user.wallet - totalPrice;
    if (updatedWalletAmount < 0) {
      throw new Error("Wallet balance cannot be negative");
    }

    await userRepositary.updatedWalletBalance(userId, updatedWalletAmount);
    await userRepositary.recordTransactionInWallet(
      userId,
      turfId,
      totalPrice,
      "debit"
    );

    const newBooking = new TurfBooking({
      userId: userId,
      turfId: turfId,
      date: date,
      selectedSlot: `${selectedStartTime} - ${selectedEndTime}`,
      totalPrice: totalPrice,
      Time: new Date(),
      paymentMethod: paymentMethod,
      bookingStatus: "confirmed",
    });
    await newBooking.save();
    return { message: "Booking successful" };
  } catch (error) {
    console.error("Error occurred while booking with wallet:", error);
    throw new Error("Failed to book with wallet");
  }
};

const createActivity = async (
  formData: any,
  bookingDetails: any,
  turfDetails: any,
  user: any
) => {
  const activityData = {
    activityName: formData.activityName,
    bookingId: bookingDetails._id,
    maxPlayers: formData.maxPlayers,
    description: formData.description,
    turfId: bookingDetails.turfId,
    userId: bookingDetails.userId,
    turfName: turfDetails.turfName,
    userName: user.username,
    slot: bookingDetails.selectedSlot,
    date: bookingDetails.date,
    address: turfDetails.address,
  };
  console.log(activityData, "activityData");
  try {
    const existingActivity = await userRepositary.getActivityByBookingId(
      bookingDetails._id
    );
    if (existingActivity) {
      throw new Error("Activity with the same booking ID already exists");
    }
    const newActivity = await userRepositary.createActivity(activityData);
    return newActivity;
  } catch (error) {
    throw new Error("Could not create activity");
  }
};

const getActivity = async () => {
  try {
    const activity = await userRepositary.getActivity();
    return activity;
  } catch (error) {
    console.log(error);
  }
};

const getActivityById = async (id: string) => {
  try {
    const activity = await Activity.findById(id);
    return activity;
  } catch (error) {
    console.log(error);
  }
};

const activityRequest = async (activityId: any, userId: any) => {
  try {
    const activity = await Activity.findById(activityId);
    console.log(activity);
    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.userId.toString() === userId) {
      throw new Error("User who created the activity cannot request to join");
    }

    const existingRequest=await userRepositary.existingRequest(activityId,userId)
    if(existingRequest){
      throw new Error('Request already sent')
    }
    activity.joinRequests.push({ user: userId, status: "pending" });
    await activity.save();

    return activity;
  } catch (error) {
    throw error;
  }
};  

const addedUserId = async (activity: any) => {
  try {
    const participantIds = activity.participants.map((participant: any) => participant);
      const participantDetails=await User.find({_id:{$in:participantIds}})
      console.log(participantDetails,'participant details')
      return participantDetails
  } catch (error) {
    console.log(error);
  }
}



export default {
  createNewUser,
  verifyLogin,
  checkUser,
  authenticateWithGoogle,
  singTurf,
  bookingGet,
  bookingGetById,
  slotavailability,
  createStripeSession,
  createBookingAndAdjustWallet,
  getUserDetails,
  editUserDetails,
  resetPassword,
  UserCancelBooking,
  bookWithWallet,
  createActivity,
  getActivity,
  getActivityById,
  activityRequest,
  addedUserId
};
