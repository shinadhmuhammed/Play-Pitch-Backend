import { ObjectId } from "mongodb";
import Admin from "../Models/adminModel";
import User from "../Models/UserModel";
import Turf from "../Models/turfModel";


const findAdmin=async(email:string)=>{
    try {
        const adminData=await Admin.findOne({email:email})
            return adminData
    } catch (error) {
        console.log(error)
    }
}


const getusers=async()=>{
    try {
        const users=await User.find()
        return users
    } catch (error) {
        console.log(error)
    }
}

const blockunblock=async(email:string,isBlocked:boolean)=>{
        try {
            return await User.updateOne({email:email},{$set:{isBlocked:!isBlocked}})
        } catch (error) {
                console.log('error in blocking the user',error)
        }
}

const getTurf=async()=>{
    try {
        const turf=await Turf.find()
        return turf
    } catch (error) {
        console.log(error)
    }
}



export default {findAdmin,getusers,blockunblock,getTurf}