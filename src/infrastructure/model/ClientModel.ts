import { Schema, model } from "mongoose";
import { IClient } from "@/domain/entities/Client";
import { UserRole } from "@/domain/types/UserRole";

const clientSchema = new Schema<IClient>(
   {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
      occupation: { type: String },
      profile: { type: String },
      isVerified: { type: Boolean, default: false },
      otp: { type: Number },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      birthDate: { type: Date },
      role: { type: String, enum: Object.values(UserRole), default: UserRole.Client, required: true },
      isBlocked: { type: Boolean, default: false },
   },
   { timestamps: true }
);

export const ClientModel = model<IClient>("Client", clientSchema);
