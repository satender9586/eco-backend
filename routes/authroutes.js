import express from "express";
import {tokenVerify,getUserDetails, registercontroller, loginController, otpverify, resendotp,forgetPassword ,updatePassword} from "../controller/authcontroller.js"


const router = express.Router();


router.post("/register", registercontroller);
router.post("/login", loginController)
router.post("/otp-verify", otpverify)
router.post("/resend-otp", resendotp)
router.post("/forget", forgetPassword)
router.post("/updatepassowrd", updatePassword)
router.post("/tokenverify", tokenVerify)
router.get("/userInfo/:userId", getUserDetails)



export default router;