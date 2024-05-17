import activityService from "../../Business/services/activityService";
import userService from "../../Business/services/userService";
import User from "../DataAccess/Models/UserModel";
import Activity from "../DataAccess/Models/activityModel";
import { Request, Response } from "express";


const createActivity = async (req: Request, res: Response) => {
  try {
    const { formData, bookingDetails, turfDetails, user } = req.body;
    const newActivity = await activityService.createActivity(
      formData,
      bookingDetails,
      turfDetails,
      user
    );
    res.status(201).json(newActivity);
  } catch (error: any) {
    console.error(error);
    if (
      error.message.includes("Activity with the same booking ID already exists")
    ) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Activity alreay created" });
    }
  }
};

const getActivity = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const activity = await activityService.getActivity();
    res.status(201).json({ userId, activity });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activity = await activityService.getActivityById(id);
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

interface CustomRequest extends Request {
  params: any;
  id?: string;
  role?: string;
}

const activityRequest = async (req: CustomRequest, res: Response) => {
  const activityId = req.params.id;
  const { username, phone } = req.body;
  const userId = req.id;
  try {
    if (userId) {
      const activity = await activityService.activityRequest(
        activityId,
        userId,
        username,
        phone
      );
      res.status(201).json(activity);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getRequest = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.id;
    const activity = await Activity.findOne({ userId });
    console.log(activity)
    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

const acceptJoinRequest = async (req: Request, res: Response) => {
  const { activityId, joinRequestId } = req.params;
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    const joinRequest = activity.joinRequests.find(
      (request) => request?._id?.toString() === joinRequestId
    );
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found" });
    }
    joinRequest.status = "accepted";
    if (joinRequest.user) {
      activity.participants.push(joinRequest.user);
    } else {
      console.error("User not found for join request:", joinRequestId);
    }

    await activity.save();

    res.status(200).json({ message: "Join request accepted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

const declineJoinRequest = async (req: Request, res: Response) => {
  const { activityId, joinRequestId } = req.params;
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    const joinRequest = activity.joinRequests.find(
      (request) => request?._id?.toString() === joinRequestId
    );
    if (!joinRequest) {
      return res.status(404).json({ message: "Join request not found" });
    }
    joinRequest.status = "rejected";

    await activity.save();

    res.status(200).json({ message: "Join request declined successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server Error" });
  }
};

const acceptedUserId = async (req: Request, res: Response) => {
  try {
    const { activity } = req.body;
    const participantDetails = await activityService.addedUserId(activity);
    res.status(200).json(participantDetails);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const activity = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.query;
    const activity = await Activity.findById(activityId);
    res.status(200).json(activity);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const editActivites = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { activityName, maxPlayers, description } = req.body;
    try {
      const editActivity = await activityService.editActivites(
        id,
        activityName,
        maxPlayers,
        description
      );

      res
        .status(200)
        .json({ message: "Activity updated successfully", editActivity });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const getActivities = async (req: Request, res: Response) => {
    const { userId } = req.body;
    try {
      const userActivity = await activityService.userActivities(userId);
      res.json({ success: true, userActivity });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  const searchActivity = async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      if (typeof query !== "string") {
        throw new Error("Query parameter must be a string");
      }
  
      const activity = await userService.activityResults(query);
      res.json({ success: true, activity });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };




export default {
  createActivity,
  getActivity,
  getActivityById,
  getRequest,
  acceptJoinRequest,
  declineJoinRequest,
  acceptedUserId,
  activityRequest,
  activity,
  editActivites,
  getActivities,
  searchActivity,
  userPhoto
};
