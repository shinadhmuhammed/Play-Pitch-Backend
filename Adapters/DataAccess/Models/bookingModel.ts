import mongoose from 'mongoose';

const TurfBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  turfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Turf',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  selectedSlot: {
    type: String,
    required: true
  },
  totalPrice:{
    type:Number,
    required:true
  },
  Time:{
    type:Date,
},
  paymentMethod: {
    type: String,
    enum: ['wallet', 'online'], 
    required: true
  },
  bookingStatus: {
    type: String,
    enum: [ 'confirmed','completed','cancelled'], 
    default: 'confirmed' 
  },
});

const TurfBooking = mongoose.model('TurfBooking', TurfBookingSchema);

export default TurfBooking;
