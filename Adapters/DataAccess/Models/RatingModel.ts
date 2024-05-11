import mongoose, { Document, Schema, Types } from 'mongoose';

interface RatingModel extends Document {
  userId: string;
  turfId:object;
  userName:string;
  rating:string ;
  message?: string;
}

const RatingSchema = new Schema<RatingModel>({
  userId: {
    type: String,
    required:true
  },
  turfId:{
    type:String,
    required:true
},
userName:{
  type:String,
  required:true
},
  rating: {
    type: String,
    required: true
  },
  message: {
    type: String,
  }
});

const Rating = mongoose.model<RatingModel>('Rating', RatingSchema);

export default Rating;
