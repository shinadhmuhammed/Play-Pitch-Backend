import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    activityName:{
        type:String,
        required:true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TurfBooking',
        required: true
    },
    maxPlayers: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    joinRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username:String,
        phone:Number,
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }],
    turfId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turf',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName:{
        type:String,
        required:true
    },
    turfName:{
        type:String,
        required:true
    },
    Profile:{
        type:String
    },
    slot:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    }
});

const Activity = mongoose.model('activityModel', activitySchema);

export default Activity;
