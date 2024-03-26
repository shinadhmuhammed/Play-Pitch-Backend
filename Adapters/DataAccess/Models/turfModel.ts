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
    facilities: {
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
    price:{
        type:Number,
        required:true
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