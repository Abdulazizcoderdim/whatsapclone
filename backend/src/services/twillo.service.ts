import twillo from "twilio";

const accountSid = process.env.TWILLO_ACCOUNT_CID as string;
const authToken = process.env.TWILLO_AUTH_TOKEN as string;
const serviceSid = process.env.TWILLO_SERVICE_CID as string;

const client = twillo(accountSid, authToken);

export const sendOtpToPhoneNumber = async (phoneNumber: string) => {
  try {
    console.log("Sending OTP to phone number", phoneNumber);
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const res = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });

    console.log("this is my otp response", res);
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send OTP to phone number");
  }
};

export const verifyOtp = async (phoneNumber: string, otp: string) => {
  try {
    const res = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: otp,
      });

    console.log("this is my otp response", res);
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to verify OTP");
  }
};
