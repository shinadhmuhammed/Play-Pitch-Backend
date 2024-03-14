import express from 'express'
const userRouter=express.Router()
import UserController from '../../Adapters/Controllers/UserController'
import JwtUser from '../Middlewares/jwtUser'





userRouter.post('/signup',UserController.signup)
userRouter.post('/verify-otp',UserController.verifyOtp)
userRouter.post('/resendotp',UserController.resendOtp)

userRouter.post('/login',UserController.login)


export default userRouter





