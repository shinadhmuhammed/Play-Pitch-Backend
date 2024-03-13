import express from 'express'
const userRouter=express.Router()
import UserController from '../../Adapters/Controllers/UserController'





userRouter.post('/signup',UserController.signup)
userRouter.post('/login',UserController.login)
userRouter.post('/verify-otp',UserController.verifyOtp)


export default userRouter





