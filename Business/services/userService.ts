import bcrypt from "bcrypt";
import User from "../../Adapters/DataAccess/Models/UserModel";
import userRepositary from "../../Adapters/DataAccess/Repositary/userRepositary";
import { ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import jwtUser from "../../FrameWorks/Middlewares/jwt/jwtUser";
import Turf from "../../Adapters/DataAccess/Models/turfModel";
import TurfBooking from "../../Adapters/DataAccess/Models/bookingModel";
import Stripe from "stripe";
import dotenv from 'dotenv'
dotenv.config()


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

const slotBooking = async (
  turfId: string,
  date: string,
  startTime: string,
  endTime: string,
  turfDetail: any,
  paymentMethod: string,
  userId: any
) => {
  const existingBooking = await userRepositary.booking(
    turfId,
    date,
    startTime,
    endTime
  );
  

  if (existingBooking) {
    throw new Error("Slot is already booked");
  }

  if (!paymentMethod) {
    throw new Error("Please select a payment method");
  }

  const newBooking = new TurfBooking({
    turfId: turfId,
    turf: turfDetail,
    date: date,
    selectedSlot: `${startTime} - ${endTime}`, 
    userId: userId,
    paymentMethod: paymentMethod,
    bookingStatus: "requested",
  });

  await userRepositary.bookingSave(newBooking);

  return { message: "Turf booked successfully" };
};




const bookingGet=async(userId:any)=>{
  try {
      const booking=await TurfBooking.find({userId:userId})
      return booking
  } catch (error) {
    console.log(error)
  }
}

const bookingGetById=async(userId:any,bookingId:any)=>{
    try {
      const booking = await TurfBooking.findOne({ userId: userId, _id: bookingId });
      if (!booking) {
        throw new Error("Booking not found");
      }
      const turfDetails = await Turf.findOne({ _id: booking.turfId });
      return { booking, turfDetails };
    } 
    catch (error) {
      console.log(error);
      throw error; 
    }
  }
  






const slotavailability=async(turfId:string,date:string,selectedStartTime:string,selectedEndTime:string)=>{
  try {
  
      const available=await userRepositary.slotBooking(turfId,date,selectedStartTime,selectedEndTime)
      return available
  } catch (error) {
    console.log(error)
  }
}





if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not defined");
}

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);


const createStripeSession = async (totalPrice: number, selectedDate: string, selectedStartTime: string, selectedEndTime: string, turfDetail: any): Promise<string> => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Turf Booking",
          },
          unit_amount: totalPrice * 100,
        },
        quantity: 1,
      },
    ],
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

const getUserDetails = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error retrieving user details:', error);
    throw new Error('Failed to retrieve user details');
  }
}


const editUserDetails=async(userId: string, userData: any)=>{
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user details:', error);
    throw new Error('Failed to update user details');
  }
};


const resetPassword=async(userId:string,newPassword:string)=>{
  try {
    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

 
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.password = hashedPassword;
    await user.save();
  } catch (error) {
    throw new Error('Error resetting password');
  }
};


export default {
  createNewUser,
  verifyLogin,
  checkUser,
  authenticateWithGoogle,
  singTurf,
  slotBooking,
  bookingGet,
  bookingGetById,
  slotavailability,
  createStripeSession,
  getUserDetails,
  editUserDetails,
  resetPassword
};
