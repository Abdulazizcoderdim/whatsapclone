import authController from "@/controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

export default router;
