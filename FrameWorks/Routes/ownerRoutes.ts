import express from "express";
import OwnerController from "../../Adapters/Controllers/OwnerController";
import multer, { Multer } from "multer";

import upload from "../Middlewares/multer";

const OwnerRouter = express.Router();
const multerUpload: Multer = upload;

OwnerRouter.post("/ownersignup", OwnerController.signup);
OwnerRouter.post("/verifyotp", OwnerController.verifyOtp);
OwnerRouter.post("/resendotp", OwnerController.resendOtp);
OwnerRouter.post("/ownerlogin", OwnerController.ownerLogin);
OwnerRouter.post("/forgot-password", OwnerController.passwordForgot);
OwnerRouter.post('/otp-forgot',OwnerController.ForgotPasswordOtp)
OwnerRouter.post('/verify-forgot',OwnerController.verifyForgotOtp)
OwnerRouter.post(
  "/addturf",
  multerUpload.single("file"),
  OwnerController.addTurf
);

export default OwnerRouter;
