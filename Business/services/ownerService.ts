import express from 'express'
import bcrypt from 'bcrypt'



const passwordBcrypt=async(password:string)=>{
    try {
        const hashedPassword=await bcrypt.hash(password,10)
        return hashedPassword
    } catch (error) {
        console.log(error)
        throw error; 
    }
}


export default {passwordBcrypt}