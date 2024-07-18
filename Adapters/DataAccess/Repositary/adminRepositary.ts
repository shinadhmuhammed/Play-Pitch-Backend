import { ObjectId } from "mongodb";
import Admin from "../Models/adminModel";
import User from "../Models/UserModel";
import Turf from "../Models/turfModel";
import TurfBooking from "../Models/bookingModel";
import moment from "moment";

const findAdmin = async (email: string) => {
  try {
    const adminData = await Admin.findOne({ email: email });
    return adminData;
  } catch (error) {
    console.log(error);
  }
};

const getusers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.log(error);
  }
};

const blockunblock = async (email: string, isBlocked: boolean) => {
  try {
    return await User.updateOne(
      { email: email },
      { $set: { isBlocked: !isBlocked } }
    );
  } catch (error) {
    console.log("error in blocking the user", error);
  }
};

const getTurf = async () => {
  try {
    const turf = await Turf.find();
    return turf;
  } catch (error) {
    console.log(error);
  }
};

const getVenueId = async (venueId: string) => {
  try {
    const venue = await Turf.findOne({ _id: venueId });
    return venue;
  } catch (error) {
    console.log(error);
  }
};

const bookingdashboardRepositary =async()=> {
  const getTotalBookings=await TurfBooking.countDocuments();
    return getTotalBookings
  }



const UserDashboardRepository =async()=> {
  const getTotalUsers= await User.countDocuments();
    return getTotalUsers
  }


  const getTodayBookings=async ()=> {
    const todayStart = moment().startOf('day');
    const todayEnd = moment().endOf('day');
    return await TurfBooking.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd }
    });
  }

  const  getMonthlyBookings=async()=> {
    const firstDayOfMonth = moment().startOf('month');
    const lastDayOfMonth = moment().endOf('month');
    return await TurfBooking.countDocuments({
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
    });
  }



export default {
  findAdmin,
  getusers,
  blockunblock,
  getTurf,
  getVenueId,
  UserDashboardRepository,
  bookingdashboardRepositary,
  getTodayBookings,
  getMonthlyBookings
};
