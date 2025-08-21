import User from "@/models/user.model";
import sendOtpToEmail from "@/services/email.service";
import { sendOtpToPhoneNumber, verifyOtp } from "@/services/twillo.service";
import { generateToken } from "@/utils/generateToken";
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

  async verifyOtp(req: Request, res: Response) {
    const { phoneNumber, phoneSuffix, email, otp } = req.body;
    try {
      let user;

      if (email) {
        user = await User.findOne({ email });

        if (!user) {
          return response(res, 404, "User not found");
        }

        const now = new Date();

        if (
          !user.emailOtp ||
          String(user.emailOtp) !== String(otp) ||
          now > new Date(user.emailOtpExpiry as Date)
        ) {
          return response(res, 400, "Invalid or expired OTP");
        }

        user.isVerified = true;
        user.emailOtp = null;
        user.emailOtpExpiry = null;
        await user.save();
      } else {
        if (!phoneNumber || !phoneSuffix) {
          return response(res, 400, "Phone number and suffix are required");
        }

        const fullPhoneNumber = `${phoneNumber}${phoneSuffix}`;

        user = await User.findOne({ phoneNumber });

        if (!user) {
          return response(res, 404, "User not found");
        }

        const result = await verifyOtp(fullPhoneNumber, otp);

        if (result.status !== "approved") {
          return response(res, 400, "Invalid otp");
        }

        user.isVerified = true;
        await user.save();
      }

      const token = generateToken(user?._id.toString());

      res.cookie("auth_token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      return response(res, 200, "OTP verified successfully", { token, user });
    } catch (error) {}
  }
}

export default new AuthController();
