import { Request, Response } from "express";
import bcrypt from "bcrypt";
import ownerRepositary from "../../Adapters/DataAccess/Repositary/ownerRepositary";
import { cloudinaryInstance } from "../../FrameWorks/Middlewares/cloudinary";
import Turf from "../../Adapters/DataAccess/Models/turfModel";
import Owner from "../../Adapters/DataAccess/Models/ownerModel";
import TurfBooking from "../../Adapters/DataAccess/Models/bookingModel";
import nodemailer from "../utils/nodemailer";

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
      price,
      courtType,
    } = req.body;

    if (!req.files || !Array.isArray(req.files)) {
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
      price,
      courtType,
      images: uploadedImages,
      turfOwner: req.id,
      isActive: false,
    });

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

const acceptBookings = async (bookingId: string, userId: string) => {
  try {
    await TurfBooking.findByIdAndUpdate(bookingId, {
      bookingStatus: "confirmed",
    });

    const user = await ownerRepositary.acceptId(userId);
    const userEmail = user?.email;

    if (userEmail) {
      const message = "Your booking request has been accepted.";
      const subject = "Booking Confirmation";
      await nodemailer.sendEmailNotification(userEmail, message, subject);
    } else {
      console.error("User email not found.");
    }

    return { message: "Booking accepted successfully" };
  } catch (error) {
    console.error("Error accepting booking:", error);
    throw new Error("Internal server error");
  }
};

const declineBooking = async (bookingId: string, userId: string) => {
  try {
    await TurfBooking.findByIdAndUpdate(bookingId, {
      bookingStatus: "declined",
    });

    const user = await ownerRepositary.acceptId(userId);
    const userEmail = user?.email;

    if (userEmail) {
      const message = "Your booking request has been Declined.";
      const subject = "Booking Confirmation";
      await nodemailer.sendEmailNotification(userEmail, message, subject);
    } else {
      console.error("User email not found.");
    }

    return { message: "Booking Declined" };
  } catch (error) {
    console.error("Error accepting booking:", error);
    throw new Error("Internal server error");
  }
};

export default {
  confirmPassword,
  createTurf,
  createNewOwner,
  editTurf,
  turfDelete,
  acceptBookings,
  declineBooking,
};
