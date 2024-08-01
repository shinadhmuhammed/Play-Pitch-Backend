import Admin from "../../Adapters/DataAccess/Models/adminModel";
import Owner from "../../Adapters/DataAccess/Models/ownerModel";
import Turf from "../../Adapters/DataAccess/Models/turfModel";
import adminRepositary from "../../Adapters/DataAccess/Repositary/adminRepositary";
import { ObjectId } from "mongoose";

interface Admin {
  email: string;
  password: string;
  isAdmin: boolean;
  role?: string;
  _id: ObjectId;
}

const adminLogin = async (
  email: string,
  password: string
): Promise<Admin | null> => {
  try {
    const admin = await adminRepositary.findAdmin(email);
    if (admin && admin.password === password) {
      return admin as unknown as Admin;
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

const blockunblock = async (email: string, isBlocked: boolean) => {
  try {
    const blockAndUnblock = await adminRepositary.blockunblock(
      email,
      isBlocked
    );
    if (blockAndUnblock) {
      return { message: true };
    } else {
      return { message: null };
    }
  } catch (error) {
    console.log("error in blocking and unblocking", error);
    return { message: null };
  }
};

const getAllVenues = async () => {
  try {
    const venues = await Turf.aggregate([
      {
        $lookup: {
          from: "ownermodels",
          localField: "turfOwner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $unwind: "$owner",
      },
      {
        $project: {
          _id: 1,
          turfName: 1,
          address: 1,
          city: 1,
          aboutVenue: 1,
          facilities: 1,
          openingTime: 1,
          closingTime: 1,
          contactNumber:1,
          price: 1,
          turfOwnerEmail: "$owner.email",
          isActive: 1,
          image: { $arrayElemAt: ["$images", 0] },
        },
      },
    ]);

    return venues;
  } catch (error) {
    console.log(error);
  }
};

const acceptVenueRequests = async (turfId: any) => {
  try {
    const turf = await Turf.findById(turfId);
    if (!turf) {
      throw new Error("Turf Not Found");
    }
    turf.isActive = true;
    await turf.save();
    return turf;
  } catch (error) {
    console.log(error, "Error Accepting Turf");
  }
};

const declineVenueRequests = async (turfId: any) => {
  try {
    const turf = await Turf.findById(turfId);
    if (!turf) {
      throw new Error("Turf Not Found");
    }
    turf.isDeclined = true;
    await turf.save();
    return turf;
  } catch (error) {
    console.log(error, "Error Declining Turf");
  }
};

const VenueById = async (venueId: string) => {
  try {
    const venue = await adminRepositary.getVenueId(venueId);
    return venue;
  } catch (error) {
    console.log(error);
    throw error;
  }
};



const getDashboard = async() => {
  try {
    const totalBookings=await adminRepositary.bookingdashboardRepositary()
    const totalUser=await adminRepositary.UserDashboardRepository()
    const todayBookings = await adminRepositary.getTodayBookings()
      const monthlyBookings = await adminRepositary.getMonthlyBookings()
    console.log(totalBookings,totalUser,todayBookings,monthlyBookings)
    return {totalBookings,totalUser,todayBookings,monthlyBookings}
  } catch (error) {
    throw new Error('Error getting dashboard information');
  }
};

const getWallet=async()=>{
  try {
    const wallet=await Admin.find()
    return wallet
  } catch (error) {
    throw new Error('Error getting wallet information');
  }
}



export default {
  adminLogin,
  blockunblock,
  getAllVenues,
  acceptVenueRequests,
  declineVenueRequests,
  VenueById,
  getDashboard,
  getWallet
};
