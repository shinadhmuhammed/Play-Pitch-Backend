import Owner from "../Models/ownerModel";
import {ObjectId} from 'mongoose'
import Turf from "../Models/turfModel";
import User from "../Models/UserModel";



interface OwnerData {
    _id: ObjectId;
    email: string;
    password:string
    phone:string
    role?:string;
  }
  
  const findOwner = async (email: string): Promise<OwnerData | null> => {
    try {
      const OwnerDatabase = await Owner.findOne({ email: email });
      return OwnerDatabase;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const updateTurf=async(id: string,updateTurfData:any)=>{
    try {
      const update=await Turf.findByIdAndUpdate(id,updateTurfData,{new:true})
      return update
    } catch (error) {
      console.log(error)
    }
  }


  const acceptId=async(id:string)=>{
    try {
      return await User.findById(id)
    } catch (error) {
      console.log(error)
    }
  }
  

  const getOwnerById=async(ownerId:string)=>{
    try {
      const owner=await Owner.findById(ownerId)
      return owner
    } catch (error) {
      console.log(error)
    }
  }



  const editDetails=async(ownerId:string,userData:any)=>{
    try {
      const edit=await Owner.findByIdAndUpdate(ownerId,userData,{new:true})
      return edit
    } catch (error) {
      console.log(error)
    }
  }
  





export default {findOwner,updateTurf,acceptId,getOwnerById,editDetails}