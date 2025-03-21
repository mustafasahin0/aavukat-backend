import { UserRole } from "@/types";

export default interface ILawyer {
   readonly _id?: string;
   readonly createdAt?: Date;
   readonly updatedAt?: Date;
   readonly email?: string;
   name?: string;
   phone?: string;
   password?: string;
   qualifications?: string[];
   role?: UserRole;
   isBlocked?: boolean;
   profileImage?: string;
   token?: string;
   isVerified?: boolean;
   specialization?: string;
   experience?: number;
}
