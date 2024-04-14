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


const updatedWalletBalance = (userId: string, updatedWalletAmount: number) => {
  return User.findByIdAndUpdate(userId, { $set: { wallet: updatedWalletAmount } });
}

const getUserById = (userId: string) => {
  return User.findById(userId);
}

const recordTransactionInWallet = (userId: string, selectedStartTime: string, turfId: string, amount: number, transactionType: string) => {
  console.log(transactionType,'yts')
  const transaction = {
    date: new Date(),
    walletType: 'wallet', 
    amount: amount,
    turfName: turfId, 
    transactionType: transactionType 
  };
  
  return User.findByIdAndUpdate(userId, { 
    $push: { 
      walletStatements: transaction
    } 
  });
}









export default {
  findUser,
  turfGet,
  booking,
  bookingSave,
  slotBooking,
  getUserById,
  updatedWalletBalance,
  recordTransactionInWallet
};
