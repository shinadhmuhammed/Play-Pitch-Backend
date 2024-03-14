import bcrypt from 'bcrypt'
import User from '../../Adapters/DataAccess/Models/UserModel'
import userRepositary from '../../Adapters/DataAccess/Repositary/userRepositary'
import {ObjectId} from 'mongodb'
import Otp from '../../Adapters/DataAccess/Models/Otp'



interface ReqBody{
    userName:string,
    email:string,
    phone:number,
    password:string,
    confirm:string
}



const createNewUser = async (user: ReqBody) => {
    try {
        const hashedPassword = await bcrypt.hash(user.password, 5);
        user.password = hashedPassword;

        const existingUser = await userRepositary.findUser(user.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = new User(user);
        await newUser.save();
        return { message: 'user created' };
    } catch (error) {
        console.log(error);
        return { message: 'user not created' };
    }
};





type User = {
    _id: ObjectId;
    username?: string | null; // Make username nullable
    email: string;
    phone?: number | null; // Make phone nullable
    password: string;
    isBlocked:boolean
};




export const verifyLogin = async (user: ReqBody): Promise<User | false> => {
    try {
        const userDetails = await userRepositary.findUser(user.email);
        if (userDetails !== undefined && userDetails !== null) {
            const passwordMatch = await bcrypt.compare(user.password, userDetails.password);
            if (passwordMatch) {
                // Omit optional properties or provide default values
                const { _id, email, password, isBlocked } = userDetails;
                return { _id, email, password, isBlocked };
            } else {
                return false; // Return false if passwords do not match
            }
        } else {
            return false; // Return false if user is not found
        }
    } catch (error) {
        console.log(error);
        return false;
    }
};






interface otp {
    userId: string;
    otp: string;
    createdAt: Date;
  }




  

export const getSavedOtp=async(userId:string)=>{
        try {
            const getOtp=await userRepositary.getOtp(userId)
            console.log(getOtp,'klkklk')
            if(getOtp) return getOtp
        } catch (error) {
            console.log('OTP Not Found')
        }
}








export default createNewUser