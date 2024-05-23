import User from "../../Adapters/DataAccess/Models/UserModel";
import Activity from "../../Adapters/DataAccess/Models/activityModel";
import userRepositary from "../../Adapters/DataAccess/Repositary/userRepositary";

const createActivity = async (
    formData: any,
    bookingDetails: any,
    turfDetails: any,
    user: any
  ) => {
    const activityData = {
      activityName: formData.activityName,
      bookingId: bookingDetails._id,
      maxPlayers: formData.maxPlayers,
      description: formData.description,
      turfId: bookingDetails.turfId,
      userId: bookingDetails.userId,
      turfName: turfDetails.turfName,
      userName: user.username,
      slot: bookingDetails.selectedSlot,
      date: bookingDetails.date,
      address: turfDetails.address,
    };
    console.log(activityData, "activityData");
    try {
      const existingActivity = await userRepositary.getActivityByBookingId(
        bookingDetails._id
      );
      if (existingActivity) {
        throw new Error("Activity with the same booking ID already exists");
      }
      const newActivity = await userRepositary.createActivity(activityData);
      return newActivity;
    } catch (error) {
      throw new Error("Could not create activity");
    }
  };
  
  const getActivity = async () => {
    try {
      const activity = await userRepositary.getActivity();
      return activity;
    } catch (error) {
      console.log(error);
    }
  };
  
  const getActivityById = async (id: string) => {
    try {
      const activity = await Activity.findById(id);
      return activity;
    } catch (error) {
      console.log(error);
    }
  };
  
  const activityRequest = async (activityId: string, userId: string,username:string,phone:number) => {
    try {
      const activity = await Activity.findById(activityId);
      if (!activity) {
        throw new Error("Activity not found");
      }
  
      const existingRequest = await userRepositary.existingRequest(
        activityId,
        userId
      );
      if (existingRequest) {
        throw new Error("Request already sent");
      }
      activity.joinRequests.push({ user: userId,username:username,phone:phone, status: "pending" });
      const user=await User.findById(userId)
      await activity.save();
      return activity;
    } catch (error) {
      throw error;
    }
  };
  
  const declinedRequest=async(activityId:string,joinRequestId:string)=>{
    try {
      const activity = await Activity.findById(activityId);
      if(activity){
      const joinRequest = activity.joinRequests.find(
        (request) => request?._id?.toString() === joinRequestId
      );
      if(joinRequest){
      joinRequest.status = "rejected"; 
      }
      await activity.save();
    }
    } catch (error) {
      throw error
    }
  }
  
  const acceptedRequest=async(activityId:string,joinRequestId:string)=>{
    try {
      const activity = await Activity.findById(activityId);
      if(activity){
      const joinRequest = activity.joinRequests.find(
        (request) => request?._id?.toString() === joinRequestId
      );
      if(joinRequest){
      joinRequest.status = "accepted"; 
      }
      await activity.save();
    }
    } catch (error) {
      throw error
    }
  }
  
  const addedUserId = async (activity: any) => {
    try {
      if (!activity.participants) {
        console.log("Participants array is empty or null");
        return [];
      }
      const participantIds = activity.participants.map(
        (participant: any) => participant
      );
      const participantDetails = await User.find({
        _id: { $in: participantIds },
      });
      return participantDetails;
    } catch (error) {
      console.log(error);
    }
  };
  
  

  const editActivites=async(id:string,activityName:string,maxPlayers:number,description:string)=>{
    try {
  
      const activity = await Activity.findById(id)
  
      if(activity){
  
      if (activityName) {
        activity.activityName = activityName;
      }
      if (maxPlayers) {
        activity.maxPlayers = maxPlayers;
      }
      if (description) {
        activity.description = description;
      }
      await activity.save();
    }
      return activity
    } catch (error) {
      throw error
    }
  }


  const userActivities=async(userId:string)=>{
    try {
      const activities = await Activity.find({ userId });
      return activities
    } catch (error) {
      throw error
    }
  }


  const profilePhoto=async(userId:string)=>{
    try {
      const user=await User.findById(userId)
      return user
    } catch (error) {
      throw error
    }
  }


  export default {
    createActivity ,
    getActivity,
    getActivityById,
    activityRequest,
    declinedRequest,
    acceptedRequest,
    addedUserId ,
    editActivites,
    userActivities,
    profilePhoto
  }