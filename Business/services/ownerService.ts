import { Request, Response } from "express";
import bcrypt from "bcrypt";
import ownerRepositary from "../../Adapters/DataAccess/Repositary/ownerRepositary";
import { cloudinaryInstance } from "../../FrameWorks/Middlewares/cloudinary";
import Turf from "../../Adapters/DataAccess/Models/turfModel";
import Owner from "../../Adapters/DataAccess/Models/ownerModel";
import TurfBooking from "../../Adapters/DataAccess/Models/bookingModel";
import nodemailer from "../utils/nodemailer";
import User from "../../Adapters/DataAccess/Models/UserModel";
import mongoose from "mongoose";

interface Ownersignup {
  email: string;
  phone: string;
  password: string;
  confirm: string;
}

interface submitResponse {
  status: number;
  message: string;
}

const createNewOwner = async (owner: Ownersignup) => {
  try {
    const hashedPassword = await bcrypt.hash(owner.password, 10);
    owner.password = hashedPassword;
    const existingOwner = await ownerRepositary.findOwner(owner.email);
    if (existingOwner) {
      throw new Error("owner already exists");
    }
    const newOwner = new Owner(owner);
    await newOwner.save();
    return { message: "user created" };
  } catch (error) {
    console.log(error);
    return { message: "user not created" };
  }
};

const confirmPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

interface CustomRequest extends Request {
  id?: string;
}

interface Prices {
  [key: string]: string;
}

const createTurf = async (req: CustomRequest, res: Response) => {
  try {
    const {
      turfName,
      address,
      city,
      aboutVenue,
      facilities,
      openingTime,
      closingTime,
      contactNumber,
      courtType,
      latitude,
      longitude,
    } = req.body;

    // Ensure courtType is always treated as an array
    const courtTypes = Array.isArray(courtType) ? courtType : [courtType];

    const prices: Prices = {};
    courtTypes.forEach((type: string | number) => {
      prices[type] = req.body[`${type}-price`];
    });

    console.log(prices, "prices");

    if (
      !turfName ||
      !address ||
      !city ||
      !aboutVenue ||
      !facilities ||
      !openingTime ||
      !closingTime ||
      !contactNumber ||
      !prices ||
      !courtType ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (courtTypes.length === 0) {
      return res.status(400).json({ message: "Court type is required" });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "Image files are required" });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];

    const uploadedImages = [];

    for (const file of files) {
      const uploadedImage = await cloudinaryInstance.uploader.upload(
        file.path,
        {
          upload_preset: "ml_default",
        }
      );
      uploadedImages.push(uploadedImage.secure_url);
    }

    const newTurf = new Turf({
      turfName,
      address,
      city,
      aboutVenue,
      facilities,
      openingTime,
      closingTime,
      contactNumber,
      courtType: courtTypes,
      latitude,
      longitude,
      images: uploadedImages,
      turfOwner: req.id,
      isActive: false,
      price: {},
    });

    courtTypes.forEach((type: string) => {
      if (prices.hasOwnProperty(type)) {
        newTurf.price[type] = prices[type];
      } else {
        // newTurf.price[type] = DEFAULT_PRICE;
      }
    });

    console.log(newTurf, 'lllolol');
    await newTurf.save();
    res.status(201).json({ message: "Turf added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const editTurf = async (id: string, updatedTurfData: any) => {
  try {
    const updatedTurf = await Turf.findByIdAndUpdate(id, updatedTurfData, {
      new: true,
    });
    return updatedTurf;
  } catch (error) {
    throw error;
  }
};

const turfDelete = async (turfId: string) => {
  try {
    const deleted = await Turf.findByIdAndDelete(turfId);
  } catch (error) {
    throw error;
  }
};

const getOwnerDetails = async (ownerId: string) => {
  try {
    const owner = await ownerRepositary.getOwnerById(ownerId);
    return owner;
  } catch (error) {
    console.error("Error retrieving user details:", error);
    throw new Error("Failed to retrieve user details");
  }
};

const editDetails = async (ownerId: string, userData: any) => {
  try {
    const updateOwner = await ownerRepositary.editDetails(ownerId, userData);
    return updateOwner;
  } catch (error) {
    console.error("Error updating owner details:", error);
  }
};

const resetPassword = async (ownerId: string, newPassword: string) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      throw new Error("Owner not found");
    }
    owner.password = hashedPassword;
    await owner.save();
  } catch (error) {
    throw new Error("Error resetting password");
  }
};



const ownerCancelBooking = async (turfId: string, bookingId: string) => {
  try {
    const booking = await TurfBooking.findById({ _id: bookingId });
    if (booking) {
      const user = await User.findById(booking.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const turf = await Turf.findById(turfId);
      if (!turf) {
        throw new Error("Turf not found");
      }

      const owner = await Owner.findOne({ _id: turf.turfOwner });
      if (!owner) {
        throw new Error("Owner not found");
      }

      const totalPrice = booking.totalPrice;
      owner.wallet -= totalPrice;
      owner.walletStatements.push({
        date: new Date(),
        walletType: "owner",
        amount: -totalPrice,
        turfName: turf.turfName,
        transactionType: "debit",
      });
      await owner.save();

      user.wallet += totalPrice;
      user.walletStatements.push({
        date: new Date(),
        walletType: "refund",
        amount: totalPrice,
        turfName: turf.turfName,
        transactionType: "credit",
      });
      await user.save();

      booking.bookingStatus = "cancelled";
      await booking.save();
      const emailMessage = `Sorry, your booking for the turf named ${turf?.turfName} has been cancelled due to some reasons. Your refunded amount will be credited to your wallet shortly.`;
      const emailSubject = "Booking Cancellation Notification";
      if (user) {
        await nodemailer.sendEmailNotification(
          user.email,
          emailMessage,
          emailSubject
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const getDashboardData = async (ownerId: string) => {
  const today = new Date();
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisYearStart = new Date(today.getFullYear(), 0, 1);

  const totalRevenueToday = await calculateRevenue(ownerId, today, today);
  const totalBookingsToday = await calculateTotalBookings(
    ownerId,
    today,
    today
  );
  const totalRevenueThisMonth = await calculateRevenue(
    ownerId,
    thisMonthStart,
    today
  );
  const totalBookingsThisMonth = await calculateTotalBookings(
    ownerId,
    thisMonthStart,
    today
  );
  const totalRevenueThisYear = await calculateRevenue(
    ownerId,
    thisYearStart,
    today
  );
  const totalBookingsThisYear = await calculateTotalBookings(
    ownerId,
    thisYearStart,
    today
  );

  return {
    totalRevenueToday,
    totalBookingsToday,
    totalRevenueThisMonth,
    totalBookingsThisMonth,
    totalRevenueThisYear,
    totalBookingsThisYear,
  };
};

const calculateRevenue = async (
  ownerId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const result = await TurfBooking.aggregate([
      {
        $match: {
          bookingStatus: "completed",
          ownerId: new mongoose.Types.ObjectId(ownerId),
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);
    console.log(result, "result");

    return result.length > 0 ? result[0].totalRevenue : 0;
  } catch (error) {
    console.error("Error calculating revenue:", error);
    throw error;
  }
};

const calculateTotalBookings = async (
  ownerId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const result = await TurfBooking.countDocuments({
      bookingStatus: "completed",
      ownerId: new mongoose.Types.ObjectId(ownerId),
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    return result;
  } catch (error) {
    console.error("Error calculating total bookings:", error);
    throw error;
  }
};

export default {
  confirmPassword,
  createTurf,
  createNewOwner,
  editTurf,
  turfDelete,
  getOwnerDetails,
  editDetails,
  resetPassword,
  ownerCancelBooking,
  getDashboardData,
};
