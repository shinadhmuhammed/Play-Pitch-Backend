import {ObjectId} from 'mongodb'
import User from '../Models/UserModel'
import Otp from '../Models/Otp'
import Turf from '../Models/turfModel'



const findUser=async(email:string)=>{
    try {
        const userDatabase=await User.findOne({email:email})
        return userDatabase
    } catch (error) {
        console.log(error)
    }
}   



const getOtp=async(userId:string)=>{
        try {
            return await Otp.findOne({userId:userId})
        } catch (error) {
            console.log('OTP not found in the database')
        }
}






    const turfGet=async()=>{
        try {
            const turf=await Turf.find()
            return turf
        } catch (error) {
                console.log(error)
        }  
    }










export default {
    findUser,getOtp,turfGet
}