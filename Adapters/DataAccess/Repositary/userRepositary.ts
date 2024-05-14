import Rating from "../Models/RatingModel";
import User from "../Models/UserModel";
import Activity from "../Models/activityModel";
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

const recordTransactionInWallet =async (userId: string, turfId: string, amount: number, transactionType: string) => {
  console.log(transactionType,'yts')
  console.log(turfId,amount,transactionType,'hai')
  const turf=await Turf.findById(turfId)
  const transaction = {
    date: new Date(),
    walletType: 'wallet', 
    amount: amount,
    turfName: turf?.turfName, 
    transactionType: transactionType 
  };
  
  return User.findByIdAndUpdate(userId, { 
    $push: { 
      walletStatements: transaction
    } 
  });
}

const getActivityByBookingId=async(bookingId:string)=>{
    try {
        const activity=await Activity.findOne({bookingId:bookingId})
        return activity
    } catch (error) {
      console.log(error)
    }
}



const createActivity=async(activityData:any)=>{
  try {
    const newActivity=Activity.create(activityData)
    return newActivity
  } catch (error) {
    console.log(error)
  }
}

const getActivity = async () => {
  try {
    const currentDate = new Date();

    const activities = await Activity.find();
    await Promise.all(activities.map(async activity => {
      const activityDate = new Date(activity.date);
      if (currentDate >= activityDate ) {
        activity.status = "completed";
        await activity.save();
      }
    }));
    const ongoingActivities = activities.filter(activity => activity.status === "ongoing");

    return ongoingActivities;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


const existingRequest=async(activityId:string,userId:string)=>{
  try {
    const activity=await Activity.findById(activityId)
    const Requests=activity?.joinRequests.find((request)=>request.user?.toString()===userId)
      return Requests
  } catch (error) {
    console.error("Error checking existing request:", error);
    throw new Error("Could not check existing request");
  }
}


const findChatUser=async(userId:string)=>{
  try {
        const user=await User.findById(userId)
        console.log(user)
        return user
  } catch (error) {
    console.error('Error reciving user:', error);
    throw new Error('Failed to get the chat user');
  }
}

const ratingGet=async(userId:string)=>{
  try {
    const ratings=await Rating.findById({userId})
    return ratings
  } catch (error) {
    
  }
}


const searchTurfName = async (query: string) => {
  try {
    const searchResults = await Turf.find({ turfName: { $regex: query, $options: 'i' } });
    return searchResults;
  } catch (error) {
    throw error;
  }
};

export default {
  findUser,
  turfGet,
  booking,
  bookingSave,
  slotBooking,
  getUserById,
  updatedWalletBalance,
  recordTransactionInWallet,
  createActivity,
  getActivity,
  getActivityByBookingId,
  existingRequest,
  findChatUser,
  ratingGet,
  searchTurfName
};
