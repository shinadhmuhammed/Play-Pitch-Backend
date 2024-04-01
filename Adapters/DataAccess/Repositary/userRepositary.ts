import User from "../Models/UserModel";
import TurfBooking from "../Models/bookingModel";
import Turf from "../Models/turfModel";

const findUser = async (email: string) => {
  try {
    const userDatabase = await User.findOne({ email: email });
    return userDatabase;
  } catch (error) {
    console.log(error);
  }
};

const turfGet = async () => {
  try {
    const turf = await Turf.find({ isActive: true });
    return turf;
  } catch (error) {
    console.log(error);
  }
};


const booking = async(turfId:string, date:string, startTime:string,endTime:string)=>
 {
  try {
    const bookings= await TurfBooking.findOne({
      turfId: turfId,
      date: date,
      selectedSlot: { $gte: startTime, $lte: endTime }
    });
    return bookings
  } catch (error) {
    console.log(error)
  }
}

const slotBooking=async(turfId:string, date:string, startTime:string,endTime:string)=>{
  try {
    const existingBooking = await TurfBooking.findOne({
      turfId: turfId,
      date: date,
      selectedSlot: { $gte: startTime, $lte: endTime }
    });
    return !existingBooking; 
  } catch (error) {
    console.log(error);
    return false;
  }
};


const bookingSave=async(booking:any)=>{
  await booking.save()
}




export default {
  findUser,
  turfGet,
  booking,
  bookingSave,
  slotBooking
};
