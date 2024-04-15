import mongoose, { Document } from "mongoose";

interface WalletStatement {
  date: Date;
  walletType: string;
  amount: number;
  turfName: string;
  transactionType: "debit" | "credit";
}


interface OwnerModel extends Document {
  email: string;
  phone: string;
  password: string;
  wallet:number;
  walletStatements: WalletStatement[];
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

const Owner = mongoose.model<OwnerModel>('ownerModel', OwnerSchema);

export default Owner;
