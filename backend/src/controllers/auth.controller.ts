import User from "@/models/user.model";
import otpGenerate from "@/utils/otpGenerator";
import { response } from "@/utils/resnponseHandler";
import type { Request, Response } from "express";

class AuthController {
  async sendOtp(req: Request, res: Response) {
    const { phoneNumber, phoneSuffix, email } = req.body;
    const otp = otpGenerate();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    let user;

    try {
      if (email) {
        user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            emailOtp: otp,
            emailOtpExpiry: expiry,
          });
        }

        return response(res, 200, "OTP sent successfully");
      }
    } catch (error) {}
  }
}

export default new AuthController();
