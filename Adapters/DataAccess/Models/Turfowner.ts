import mongoose, { Document } from "mongoose";

interface OwnerModel extends Document {
  email: string;
  phone: string;
  password: string;
}

const OwnerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Owner = mongoose.model<OwnerModel>('ownerModel', OwnerSchema);

export default Owner;
