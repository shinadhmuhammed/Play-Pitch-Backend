import express from 'express'
import bcrypt from 'bcrypt'
import ownerRepositary from '../../Adapters/DataAccess/Repositary/ownerRepositary'


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





export default {passwordBcrypt,confirmPassword}