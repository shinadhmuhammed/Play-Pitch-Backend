import mongoose from "mongoose";

const adminSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    isAdmin :  {
        type :Boolean,
        default : true
    }
})

const Admin=mongoose.model('adminModel',adminSchema)
export default Admin