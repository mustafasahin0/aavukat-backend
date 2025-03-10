import IOtp from "@/domain/entities/IOtp";
import IOtpRepository from "@/domain/interface/repositories/IOtpRepository";
import OtpModel from "@/infrastructure/model/OtpModel";

export default class OtpRepository implements IOtpRepository {
   async create(otp: IOtp, email: string): Promise<void> {
      await OtpModel.create(otp);
   }

   async findOne(otp: string, email: string): Promise<IOtp | null> {
      const otpDoc = await OtpModel.findOne({ code: otp, email });
      return otpDoc;
   }

   async findByEmail(email: string): Promise<IOtp | null> {
      const otpDoc = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
      return otpDoc;
   }

   async deleteMany(email: string): Promise<void> {
      await OtpModel.deleteMany({ email });
   }

   async deleteByEmail(email: string): Promise<void> {
      await OtpModel.deleteMany({ email });
   }
}
