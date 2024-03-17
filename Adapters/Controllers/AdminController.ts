import { Request, Response } from "express";
import adminService from "../../Business/services/adminService";
import adminRepositary from "../DataAccess/Repositary/adminRepositary";




const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const admin = await adminService.adminLogin(email, password);
        if (admin) {
            res.status(200).json({ message: "Login successful" });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};


const getUsers=async(req:Request,res:Response)=>{
    try {
        const users=await adminRepositary.getusers()
            res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" });
    }
}


interface blockandunblock{
    email:string,
    isBlocked:boolean
}

const blockAndUnblock=async(req:Request<{},{},blockandunblock>,res:Response)=>{
            try {
                const {email,isBlocked}=req.body
                console.log(req.body)
                const blockunblock=await adminService.blockunblock(email,isBlocked)
                if(blockunblock){
                    res.status(201).json({status:201})
                }else{
                    res.status(404).json({status:404})
                }
            } catch (error) {
                console.log('error in blocking the user in admin controller')
            }
}


export default {adminLogin,getUsers,blockAndUnblock}