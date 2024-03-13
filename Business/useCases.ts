import bcrypt from 'bcrypt'
import User from '../Adapters/DataAccess/Models/UserModel'
import userRepositary from '../Adapters/DataAccess/Repositary/userRepositary'
import {ObjectId} from 'mongodb'



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






export const verifyLogin = async (user: ReqBody): Promise<boolean> => {
    try {
        const userDetails = await userRepositary.findUser(user.email);
        if (userDetails !== undefined && userDetails !== null) {
            return await bcrypt.compare(user.password, userDetails.password);
        } else {
            return false; 
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