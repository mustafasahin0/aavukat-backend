import { UserRole } from "@/domain/types/UserRole";

export interface IClient {
   readonly _id?: string;
   readonly createdAt?: Date;
   readonly updatedAt?: Date;
   readonly email: string;
   name: string;
   password: string;
   phone?: string;
   address?: string;
   occupation?: string;
   profile?: string;
   isVerified?: boolean;
   otp?: number;
   gender?: "Male" | "Female" | "Other";
   birthDate?: Date;
   isSubscribed?: boolean;
   isBlocked?: boolean;
   token?: string;
   role: UserRole;
}
