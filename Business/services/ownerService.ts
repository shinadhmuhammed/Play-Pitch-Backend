import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import ownerRepositary from '../../Adapters/DataAccess/Repositary/ownerRepositary'
import { cloudinaryInstance } from '../../FrameWorks/Middlewares/cloudinary';
import Turf from '../../Adapters/DataAccess/Models/turfModel';
import Owner from '../../Adapters/DataAccess/Models/Turfowner';


interface Ownersignup {
    email: string;
    phone: string;
    password: string;
    confirm:string;
  }
  
  interface submitResponse {
    status: number;
    message: string;
  }


  const createNewOwner=async(owner:Ownersignup)=>{
        try {
            const hashedPassword=await bcrypt.hash(owner.password,10)
            owner.password=hashedPassword
            const existingOwner=await ownerRepositary.findOwner(owner.email)
            if(existingOwner){
                throw new Error('owner already exists')
            }
            const newOwner=new Owner(owner)
            await newOwner.save()
            return {message:'user created'}
        } catch (error) {
            console.log(error)
            return {message:'user not created'}
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






export default {confirmPassword,createTurf,createNewOwner}