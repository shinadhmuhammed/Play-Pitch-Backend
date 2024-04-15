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
    },
    wallet:{
        default:0,
        type:Number
    },
    walletStatements:[
        {
        date:Date,
        walletType:String,
        amount:Number,
        turfName:String,
        transactionType:{
            type:String,
            enum:['debit','credit']
        }
    }
]
})

const Admin=mongoose.model('adminModel',adminSchema)
export default Admin