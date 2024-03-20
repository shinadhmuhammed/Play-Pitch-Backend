
import User from '../Models/UserModel'
import Turf from '../Models/turfModel'



const findUser=async(email:string)=>{
    try {
        const userDatabase=await User.findOne({email:email})
        return userDatabase
    } catch (error) {
        console.log(error)
    }
}   










    const turfGet=async()=>{
        try {
            const turf=await Turf.find()
            return turf
        } catch (error) {
                console.log(error)
        }  
    }










export default {
    findUser,turfGet
}