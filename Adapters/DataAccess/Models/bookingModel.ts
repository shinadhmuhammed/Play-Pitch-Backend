import mongoose from 'mongoose';
import cron from 'node-cron';

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


const updateBookingStatuses = async () => {
  try {
    const expiredBookings = await TurfBooking.find({
      bookingStatus: 'confirmed',
      date: { $lt: new Date() },
    });
    for (const booking of expiredBookings) {
      booking.bookingStatus = 'completed';
      await booking.save();
    }

    console.log('Booking statuses updated successfully');
  } catch (error) {
    console.error('Error updating booking statuses:', error);
  }
};


cron.schedule('0 * * * *', updateBookingStatuses);

export default TurfBooking;
