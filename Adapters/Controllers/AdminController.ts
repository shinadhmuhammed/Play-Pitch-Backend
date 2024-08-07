import { Request, Response } from "express";
import adminService from "../../Business/services/adminService";
import adminRepositary from "../DataAccess/Repositary/adminRepositary";
import jwtAdmin from "../../FrameWorks/Middlewares/jwt/jwtAdmin";
import nodemailer from "../../Business/utils/nodemailer";

const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await adminService.adminLogin(email, password);
    if (admin) {
      const role = admin.role || "admin";
      const token = jwtAdmin.generateToken(admin._id.toString());
      res.status(200).json({ message: "Login successful", token });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await adminRepositary.getusers();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

interface blockandunblock {
  email: string;
  isBlocked: boolean;
}

const blockAndUnblock = async (
  req: Request<{}, {}, blockandunblock>,
  res: Response
) => {
  try {
    const { email, isBlocked } = req.body;
    const blockunblock = await adminService.blockunblock(email, isBlocked);
    if (blockunblock) {
      res.status(201).json({ status: 201 });
    } else {
      res.status(404).json({ status: 404 });
    }
  } catch (error) {
    console.log("error in blocking the user in admin controller");
  }
};

const venueRequests = async (req: Request, res: Response) => {
  try {
    const venues = await adminService.getAllVenues();
    res.status(200).json(venues);
  } catch (error) {
    res.status(404).json({ message: "Failed to fetch venues" });
  }
};

const venueAccepts = async (req: Request, res: Response) => {
  const { turfId, turfOwnerEmail } = req.body;
  try {
    const updatedTurf = await adminService.acceptVenueRequests(turfId);
    const message = `Your turf with ID ${turfId} has been accepted.`;
    const subject = "Turf Accepted Notification";
    await nodemailer.sendEmailNotification(turfOwnerEmail, message, subject);
    res.status(200).json({ message: "Turf Added Successfully", updatedTurf });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const venueDecline = async (req: Request, res: Response) => {
  const { turfId, turfOwnerEmail } = req.body;
  console.log(turfId, turfOwnerEmail, "declineeeeeeeeeee");
  try {
    const message = `Your turf with ID ${turfId} has been declined.`;
    const subject = "Turf Declined Notification";
    await nodemailer.sendEmailNotification(turfOwnerEmail, message, subject);

    const updatedTurf = await adminService.declineVenueRequests(turfId);
    res
      .status(200)
      .json({ message: "Turf Declined Successfully", updatedTurf });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

interface CustomRequest extends Request {
  id?: string;
  role?: string;
}

const getVenueById = async (req: Request, res: Response) => {
  try {
    const venueId = req.params.venueId;
    const VenueById = await adminService.VenueById(venueId);
    res.status(200).json(VenueById);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminDashboard =async(req: Request, res: Response) => {
  try {
    const dashboard=await adminService.getDashboard()
    res.status(200).json(dashboard)
  } catch (error) {
    res.status(500).json({ message:"internal server error" });
  }
};

const adminWallet=async(req: Request, res: Response)=>{
    try {
        const wallet=await adminService.getWallet()
        res.status(200).json(wallet)
    } catch (error) {
      res.status(500).json({ message:"internal server error" });
    }
}


export default {
  adminLogin,
  getUsers,
  blockAndUnblock,
  venueRequests,
  venueAccepts,
  venueDecline,
  getVenueById,
  adminDashboard,
  adminWallet
};
