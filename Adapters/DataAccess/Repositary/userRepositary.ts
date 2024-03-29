import User from "../Models/UserModel";
import userBooking from "../Models/bookingModel";
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


const slotSave = async (
  turfId: string,
  Date: string,
  selectedSlot: string,
  turfName: string,
  address: string,
  city: string,
  price: number
) => {
  // try {
  //   const booking = new userBooking({
  //     turfId: turfId,
  //     selectedSlot: selectedSlot,
  //     turfName: turfName,
  //     turfAddress: address,
  //     turfCity: city,
  //     turfPrice: price,
  //     date: Date,
  //   });
  //   await booking.save();
  // } catch (error) {
  //   console.error("Error storing booking:", error);
  //   throw error;
  // }
};

export default {
  findUser,
  turfGet,
  slotSave,
};
