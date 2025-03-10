import { model, Schema } from "mongoose";
import IOtp from "@/domain/entities/IOtp";

const otpSchema = new Schema<IOtp>(
   {
      email: { type: String, required: true },
      code: { type: String, required: true },
      expiry: { type: Date, required: true },
   },
   {
      timestamps: true,
      versionKey: false,
      minimize: false,
   }
);

const OtpModel = model<IOtp>("Otp", otpSchema);
export default OtpModel;
