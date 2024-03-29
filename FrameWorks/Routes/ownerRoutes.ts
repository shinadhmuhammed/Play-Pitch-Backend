import express from "express";
import OwnerController from "../../Adapters/Controllers/OwnerController";
import multer, { Multer } from "multer";

import upload from "../Middlewares/multer";
import jwtOwner from "../Middlewares/jwt/jwtOwner";


const OwnerRouter = express.Router();
const multerUpload: Multer = upload;

OwnerRouter.post("/ownersignup", OwnerController.signup);
OwnerRouter.post("/verifyotp", OwnerController.verifyOtp);
OwnerRouter.post("/resendotp", OwnerController.resendOtp);
OwnerRouter.post("/ownerlogin", OwnerController.ownerLogin);
OwnerRouter.post("/forgot-password", OwnerController.passwordForgot);
OwnerRouter.post('/otp-forgot',OwnerController.ForgotPasswordOtp)
OwnerRouter.post('/verify-forgot',OwnerController.verifyForgotOtp)
OwnerRouter.post("/addturf", multerUpload.array("file"), jwtOwner.verifyOwnerJwt, OwnerController.addTurf);
OwnerRouter.get("/getownerturf", jwtOwner.verifyOwnerJwt, OwnerController.getOwnerTurf);
OwnerRouter.get("/getownerturf/:id", jwtOwner.verifyOwnerJwt, OwnerController.getOwnerTurfById);
OwnerRouter.put("/editturf/:id",jwtOwner.verifyOwnerJwt, OwnerController.editTurf);
OwnerRouter.delete("/deleteturf/:id",jwtOwner.verifyOwnerJwt, OwnerController.deleteTurf);
OwnerRouter.get("/getbookingsforowner/:turfId", jwtOwner.verifyOwnerJwt, OwnerController.getBookingsForTurf);
OwnerRouter.post("/bookingaccept", jwtOwner.verifyOwnerJwt, OwnerController.bookingAccept);
OwnerRouter.post("/bookingdecline", jwtOwner.verifyOwnerJwt, OwnerController.bookingDecline);



export default OwnerRouter;
