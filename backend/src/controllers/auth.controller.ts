import User from "@/models/user.model";
import sendOtpToEmail from "@/services/email.service";
import { sendOtpToPhoneNumber } from "@/services/twillo.service";
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
          user = new User({ email });
        }

        user.emailOtp = otp;
        user.emailOtpExpiry = expiry;
        await user.save();

        await sendOtpToEmail(email, otp);

        return response(res, 200, "OTP sent successfully");
      }

      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone number and suffix are required");
      }

      const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;

      user = await User.findOne({ phoneNumber });

      if (!user) {
        user = new User({
          phoneNumber,
          phoneSuffix,
        });
      }

      await sendOtpToPhoneNumber(fullPhoneNumber);
      await user.save();

      return response(res, 200, "OTP sent successfully", user);
    } catch (error) {
      console.error(error);
      return response(res, 500, "Something went wrong");
    }
  }
}

export default new AuthController();
