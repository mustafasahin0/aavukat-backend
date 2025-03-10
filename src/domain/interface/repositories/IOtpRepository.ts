import IOtp from "../../entities/IOtp";

export default interface IOtpRepository {
   create(otp: IOtp, email: string): Promise<void>;
   findOne(otp: string, email: string): Promise<IOtp | null>;
   findByEmail(email: string): Promise<IOtp | null>;
   deleteMany(email: string): Promise<void>;
   deleteByEmail(email: string): Promise<void>;
}
