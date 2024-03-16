import mongoose from "mongoose";


const OwnerSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    otp: {
        type: String
    },
})

const Owner=mongoose.model('ownerModel',OwnerSchema)
export default Owner