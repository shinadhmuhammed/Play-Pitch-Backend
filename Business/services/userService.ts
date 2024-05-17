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
import Chat from "../../Adapters/DataAccess/Models/chatModel";
import Rating from "../../Adapters/DataAccess/Models/RatingModel";
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
  ownerId: string,
  selectedStartTime: string,
  selectedEndTime: string,
  turfDetail: any
): Promise<string> => {
  const customer = await stripe.customers.create({
    name: "shinadh",
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
    success_url: `https://play-pitch.vercel.app/booking-verification?turfId=${encodeURIComponent(
      turfDetail._id
    )}&date=${encodeURIComponent(
      selectedDate
    )}&selectedStartTime=${encodeURIComponent(
      selectedStartTime
    )}&selectedEndTime=${encodeURIComponent(
      selectedEndTime
    )}&paymentMethod=online&totalPrice=${encodeURIComponent(
      totalPrice.toString()
    )}&ownerId=${encodeURIComponent(ownerId)}`,
    cancel_url: "https://play-pitch.vercel.app/booking-cancel",
  });
  return session.id;
};

const createBookingAndAdjustWallet = async (
  userId: string,
  turfId: string,
  ownerId: string,
  date: Date,
  selectedStartTime: string,
  selectedEndTime: string,
  totalPrice: number
) => {
  try {
    const currentTime = new Date();
    const bookingData = {
      ownerId: ownerId,
      turfId: turfId,
      date: date,
      userId: userId,
      selectedSlot: `${selectedStartTime} - ${selectedEndTime}`,
      totalPrice: totalPrice,
      Time: currentTime,
      paymentMethod: "online",
    };
    const createdBooking = await TurfBooking.create(bookingData);
    const turf = await Turf.findById(turfId);
    if (!turf) {
      throw new Error("Turf not found");
    }

    const ownerAmount = totalPrice * 0.9;
    const adminAmount = totalPrice * 0.1;

    const owner = await Owner.findOneAndUpdate(
      { _id: ownerId },
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
      const timeDifference = bookingTime.getTime() - cancellationTime.getTime();
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      if (hoursDifference < 1) {
        refundAmount = 0;
      } else if (hoursDifference < 10) {
        refundAmount = booking.totalPrice / 2;
      } else {
        refundAmount = booking.totalPrice;
      }
    }

    const turf = await Turf.findById(booking?.turfId);
    const user = await User.findById(booking?.userId);

    if (user) {
      user.wallet += refundAmount;
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
  ownerId: string,
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
      ownerId: ownerId,
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

const activityRequest = async (activityId: string, userId: string,username:string,phone:number) => {
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const existingRequest = await userRepositary.existingRequest(
      activityId,
      userId
    );
    if (existingRequest) {
      throw new Error("Request already sent");
    }
    activity.joinRequests.push({ user: userId,username:username,phone:phone, status: "pending" });
    const user=await User.findById(userId)
    // if(user?.notificationToken){
    //   await sendNotification(user.notificationToken, { title: 'New Message', body: 'You have a new message!' });
    // }
    await activity.save();
    return activity;
  } catch (error) {
    throw error;
  }
};

const declinedRequest=async(activityId:string,joinRequestId:string)=>{
  try {
    const activity = await Activity.findById(activityId);
    if(activity){
    const joinRequest = activity.joinRequests.find(
      (request) => request?._id?.toString() === joinRequestId
    );
    if(joinRequest){
    joinRequest.status = "rejected"; 
    }
    await activity.save();
  }
  } catch (error) {
    throw error
  }
}

const acceptedRequest=async(activityId:string,joinRequestId:string)=>{
  try {
    const activity = await Activity.findById(activityId);
    if(activity){
    const joinRequest = activity.joinRequests.find(
      (request) => request?._id?.toString() === joinRequestId
    );
    if(joinRequest){
    joinRequest.status = "accepted"; 
    }
    await activity.save();
  }
  } catch (error) {
    throw error
  }
}

const addedUserId = async (activity: any) => {
  try {
    if (!activity.participants) {
      console.log("Participants array is empty or null");
      return [];
    }
    const participantIds = activity.participants.map(
      (participant: any) => participant
    );
    const participantDetails = await User.find({
      _id: { $in: participantIds },
    });
    return participantDetails;
  } catch (error) {
    console.log(error);
  }
};

interface Chat {
  sender: string;
  message: string;
  roomId: string;
  timeStamp: Date;
  chatUser: string;
}

const saveChatMessages = async (chat: Chat) => {
  try {
    const chatMessages = new Chat({
      sender: chat.sender,
      message: chat.message,
      activityId: chat.roomId,
      timeStamp: chat.timeStamp,
      senderName: chat.chatUser,
    });

    const saveChatMessages = await chatMessages.save();
    return saveChatMessages;
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw new Error("Failed to save chat message");
  }
};

const getChat = async (activityId: any) => {
  try {
    const getChat = await Chat.find({ activityId });
    return getChat;
  } catch (error) {
    console.log(error);
  }
};

const chatUser = async (userId: string) => {
  try {
    const user = await userRepositary.findChatUser(userId);
    return user;
  } catch (error) {
    console.error("Error reciving user:", error);
    throw new Error("Failed to get the chat user");
  }
};

const getTurfRating = async (turfId: string) => {
  try {
    const turfs = await Rating.find({ turfId: turfId });
    return turfs;
  } catch (error) {}
};

const ratingSave = async (
  userId: string,
  turfId: string,
  message: string,
  rating: string,
  userName: string
) => {
  try {
    const newRating = new Rating({
      userId,
      turfId,
      message,
      rating,
      userName,
    });
    const savedRating = await newRating.save();
    return savedRating;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save rating");
  }
};

const getRating = async (userId: string) => {
  try {
    const ratings = await Rating.find({ userId: userId });
    return ratings;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get rating");
  }
};


const usersRating = async (userId: string) => {
  try {
    const users = await User.findById(userId);
    return users;
  } catch (error) {
    throw new Error("Failed to get user");
  }
};


const getTurfRatings = async (turfId: string) => {
  try {
    const ratings = await Rating.find({ turfId });
    return ratings;
  } catch (error) {
    throw new Error("Error fetching ratings for the turf");
  }
};

const searchName=async(query:string)=>{
  try {
    const searchResults=await userRepositary.searchTurfName(query)
    return searchResults
  } catch (error) {
    throw error;
  }
}


const fetchTurfSuggestionsFromDatabase = async (query:string) => {
  try {
    const regex = new RegExp(`^${query}`, 'i');
    const turfs = await Turf.find({ turfName: regex }).limit(10); 
    const suggestions = turfs.map((turf) => turf.turfName);
    return suggestions;
  } catch (error) {
    console.error("Error fetching turf search suggestions:", error);
    throw error; 
  }
};


const activityResults=async(query:string)=>{
  try {
    const activities = await Activity.find({ activityName: { $regex: new RegExp(query, 'i') } });
    return activities
  } catch (error) {
    throw error; 
  }
}

const userActivities=async(userId:string)=>{
  try {
    const activities = await Activity.find({ userId });
    return activities
  } catch (error) {
    throw error
  }
}


const editActivites=async(id:string,activityName:string,maxPlayers:number,description:string)=>{
  try {

    const activity = await Activity.findById(id)

    if(activity){

    if (activityName) {
      activity.activityName = activityName;
    }
    if (maxPlayers) {
      activity.maxPlayers = maxPlayers;
    }
    if (description) {
      activity.description = description;
    }
    await activity.save();
  }
    return activity
  } catch (error) {
    throw error
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
  declinedRequest,
  acceptedRequest,
  addedUserId,
  saveChatMessages,
  getChat,
  chatUser,
  ratingSave,
  getRating,
  getTurfRating,
  usersRating,
  getTurfRatings,
  searchName,
  fetchTurfSuggestionsFromDatabase,
  activityResults,
  userActivities,
  editActivites
};
