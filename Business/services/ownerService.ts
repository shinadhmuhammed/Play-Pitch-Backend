import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import ownerRepositary from '../../Adapters/DataAccess/Repositary/ownerRepositary'
import { cloudinaryInstance } from '../../FrameWorks/Middlewares/cloudinary';
import Turf from '../../Adapters/DataAccess/Models/turfModel';


interface Ownersignup {
    email: string;
    phone: string;
    password: string;
    otp?: string;
  }
  
  interface submitResponse {
    status: number;
    message: string;
  }


const passwordBcrypt=async(password:string)=>{
    try {
        const hashedPassword=await bcrypt.hash(password,10)
        return hashedPassword
    } catch (error) {
        console.log(error)
        throw error; 
    }
}

const confirmPassword=async(plainPassword:string,hashedPassword:string):Promise<boolean>=>{
    return await bcrypt.compare(plainPassword, hashedPassword)
}


const createTurf = async (req: Request, res: Response) => {
    try {
        const {
            turfName,
            address,
            city,
            aboutVenue,
            facilities,
            openingTime,
            closingTime,
            price,
        } = req.body;
    
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
        }
    
        const uploadedImage = await cloudinaryInstance.uploader.upload(req.file.path, {
            upload_preset: 'ml_default'
        });
    
        const newTurf = new Turf({
            turfName,
            address,
            city,
            aboutVenue,
            facilities,
            openingTime,
            closingTime,
            price,
            image: uploadedImage.secure_url 
        });
    
        await newTurf.save();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' }); 
    }
}



export default {passwordBcrypt,confirmPassword,createTurf}