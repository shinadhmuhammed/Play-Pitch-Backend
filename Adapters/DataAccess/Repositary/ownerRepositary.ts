import Owner from "../Models/Turfowner";



const findOwner=async(email:string)=>{
    try {
        const OwnerDatabase=await Owner.findOne({email:email})
        return OwnerDatabase
    } catch (error) {
        console.log(error)
    }
}






export default {findOwner}