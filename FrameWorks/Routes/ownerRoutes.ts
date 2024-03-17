import express from 'express';
import OwnerController from '../../Adapters/Controllers/OwnerController';
import multer, { Multer } from 'multer'; 

import upload from '../Middlewares/multer';

const OwnerRouter = express.Router();
const multerUpload: Multer = upload; // Define multerUpload as Multer instance

OwnerRouter.post('/ownersignup', OwnerController.signup);
OwnerRouter.post('/verifyotp', OwnerController.verifyOtp);
OwnerRouter.post('/resendotp', OwnerController.resendOtp);
OwnerRouter.post('/ownerlogin', OwnerController.ownerLogin);
OwnerRouter.post('/addturf', multerUpload.single('file'), OwnerController.addTurf); 

export default OwnerRouter;
