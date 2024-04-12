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




interface Prices {
  [key: string]: string; // Define a string index signature
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
      courtType,
      latitude,
      longitude,
    } = req.body;

    console.log(req.body);

    const prices: Prices = {};
    courtType.forEach((type: string | number) => {
      prices[type] = req.body[`${type}-price`];
    });

    console.log(prices, 'prices');
    if (
      !turfName ||
      !address ||
      !city ||
      !aboutVenue ||
      !facilities ||
      !openingTime ||
      !closingTime ||
      !prices || 
      !courtType ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }


    const courtTypes = Array.isArray(courtType) ? courtType : [courtType];

    if (courtTypes.length === 0) {
      return res.status(400).json({ message: "Court type is required" });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "Image files are required" });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];

    const uploadedImages = [];

    // Upload images to cloudinary
    for (const file of files) {
      const uploadedImage = await cloudinaryInstance.uploader.upload(
        file.path,
        {
          upload_preset: "ml_default",
        }
      );
      uploadedImages.push(uploadedImage.secure_url);
    }

    // Create a new Turf document
    const newTurf = new Turf({
      turfName,
      address,
      city,
      aboutVenue,
      facilities,
      openingTime,
      closingTime,
      courtType,
      latitude,
      longitude,
      images: uploadedImages,
      turfOwner: req.id,
      isActive: false,
      price: {} // Initialize price as an empty object
    });

    // Assign prices for each court type
    courtTypes.forEach((type: string) => {
      // Check if the price for the current court type exists
      if (prices.hasOwnProperty(type)) {
        newTurf.price[type] = prices[type];
      } else {
        // If price is not provided for a court type, you may handle it accordingly
        // For example, you can set a default price or skip assigning the price
        // newTurf.price[type] = DEFAULT_PRICE;
      }
    });

    // Save the new Turf document to the database
    await newTurf.save();

    // Respond with success message
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

export default {
  confirmPassword,
  createTurf,
  createNewOwner,
  editTurf,
  turfDelete,
  getOwnerDetails,
  editDetails,
  resetPassword,
};
