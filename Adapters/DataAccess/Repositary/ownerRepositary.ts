import Owner from "../Models/Turfowner";



const findOwner=async(email:string)=>{
    try {
        const OwnerDatabase=await Owner.findOne({email:email})
        return OwnerDatabase
    } catch (error) {
        console.log(error)
    }
}


const saveOtp = async (email: string, otp: string) => {
    try {
      await Owner.findOneAndUpdate({ email }, { otp });
    } catch (error) {
      throw new Error("Error saving OTP to database");
    }
  };

export default {findOwner,saveOtp}