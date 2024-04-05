import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: String,
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
    profilePhotoUrl: String,
    isBlocked: {
        type: Boolean,
        default: false
    }
});



const User=mongoose.model('userModel',UserSchema)
export default User

