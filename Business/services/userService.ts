import bcrypt from 'bcrypt'
import User from '../../Adapters/DataAccess/Models/UserModel'
import userRepositary from '../../Adapters/DataAccess/Repositary/userRepositary'
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





type User = {
    role: string
    _id: ObjectId;
    username?: string | null; 
    email: string;
    phone?: number | null; 
    password: string;
    isBlocked:boolean
};




export const verifyLogin = async (user: ReqBody): Promise<User | false> => {
    try {
        const userDetails = await userRepositary.findUser(user.email);
        if (userDetails !== undefined && userDetails !== null) {
            const passwordMatch = await bcrypt.compare(user.password, userDetails.password);
            if (passwordMatch) {
                const { _id, email, password, isBlocked } = userDetails;
                return { _id, email, password, isBlocked,role:'user' };
            } else {
                return false; 
            }
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




export const checkUser=async(userId:string)=>{
        try {
            const findUser=await userRepositary.findUser(userId)
            if(findUser !== undefined){
                if(findUser !== null){
                    if(findUser.email){
                        return {message:'user Exists'}
                    }else{
                        return {message:'User Not Found'}
                    }
                }
            }
            return {message:'User Not Found'}
        } catch (error) {
            console.log('error is happening for verifying')
        }
}







export default createNewUser