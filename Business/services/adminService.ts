import adminRepositary from "../../Adapters/DataAccess/Repositary/adminRepositary";




const adminLogin = async (email: string, password: string) => {
    try {
        const admin = await adminRepositary.findAdmin(email);
        if (admin && admin.password === password) {
            return admin;
        } else {
            return null; 
        }
    } catch (error) {
        throw error;
    }
};


const blockunblock=async(email:string,isBlocked:boolean)=>{
        try {
            const blockAndUnblock=await adminRepositary.blockunblock(email,isBlocked)
            if(blockAndUnblock){
                return {message:true}
            }else{
                return {message:null}
            }
        } catch (error) {
            console.log('error in blocking and unblocking',error)
            return {message:null}
        }
}


export default {adminLogin,blockunblock}