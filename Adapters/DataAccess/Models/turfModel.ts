import mongoose from "mongoose"

const turfSchema=new mongoose.Schema({

    turfName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    aboutVenue: {
        type: String,
        required: true
    },
    openingTime: {
        type: String,
        required: true
    },
    closingTime: {
        type: String,
        required: true
    },
    facilities: {
        type: String,
        required: true
    },
    price: {
        type: mongoose.Schema.Types.Mixed, 
        required: true
      },
    courtType: [{
        type: String,
        enum: ['5-aside', '6-aside', '7-aside', '8-aside', '10-aside', '11-aside'],
        required: true
      }],
    latitude: {
        type: Number,
        required: true
    },
    contactNumber:{
        type:Number,
        required:true
    },
    longitude: {
        type: Number,
        required: true
    },
    images: [{ type: String }],
    turfOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Owner', 
        required: true
    },
    isActive: {
        type: Boolean,
        default: false 
    },
    isDeclined: {
        type: Boolean,
        default: false
    },
})


const Turf=mongoose.model('Turf',turfSchema)
export default Turf