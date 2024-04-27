import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username:{ 
        type:String,    
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: String,
    password: {
        type: String,
        required: true
    },
    profilePhotoUrl:{ type: String },
    isBlocked: {
        type: Boolean,
        default: false
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
});



const User=mongoose.model('userModel',UserSchema)
export default User

