import mongoose from "mongoose";

const otpSchema=new mongoose.Schema({
    userId:String,
    otp:String,
    createAt:{
        type:Date,
        required:true
    },

})

otpSchema.index({ createAt: 1 }, { expireAfterSeconds: 600 });

const Otp=mongoose.model('otp',otpSchema)
export default Otp

