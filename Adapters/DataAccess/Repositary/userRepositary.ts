import {ObjectId} from 'mongodb'
import User from '../Models/UserModel'
import Otp from '../Models/Otp'



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



const saveOtpInDatabase = async (userId: string, otp: string) => {
    try {
        const existingOtp = await Otp.findOne({ userId: userId });
        if (existingOtp) {
            existingOtp.otp = otp;
            await existingOtp.save();
        } else {
            const newOtp = new Otp({
                userId: userId,
                otp: otp,
                createAt: new Date(),
            });
            await newOtp.save();
        }
    } catch (error) {
        console.error("Error saving OTP in the database:", error);
        throw error;
    }
};











export default {
    findUser,getOtp,saveOtpInDatabase
}