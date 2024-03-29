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
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'], 
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['requested', 'confirmed','declined'], 
    default: 'requested' 
  }
});

const TurfBooking = mongoose.model('TurfBooking', TurfBookingSchema);

export default TurfBooking;
