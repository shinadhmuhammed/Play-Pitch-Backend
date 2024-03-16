import express from 'express'
import OwnerController from '../../Adapters/Controllers/OwnerController'
const OwnerRouter=express.Router()





OwnerRouter.post('/ownersignup',OwnerController.signup)
OwnerRouter.post('/verifyotp',OwnerController.verifyOtp)
OwnerRouter.post('/resendotp',OwnerController.resendOtp)
OwnerRouter.post('/ownerlogin',OwnerController.ownerLogin)




export default OwnerRouter