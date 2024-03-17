import express from 'express'
const userRouter=express.Router()
import UserController from '../../Adapters/Controllers/UserController'
import JwtUser from '../Middlewares/jwt/jwtUser'





userRouter.post('/signup',UserController.signup)
userRouter.post('/verify-otp',UserController.verifyOtp)
userRouter.post('/resendotp',UserController.resendOtp)
userRouter.post('/login',UserController.login)
userRouter.post('/forgotpassword',UserController.forgotPassword)
userRouter.post('/sendotp',UserController.sendOtp)
userRouter.get('/getturf',UserController.getTurf)



export default userRouter





