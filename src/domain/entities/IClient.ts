export default interface IClient {
   readonly _id?: string;
   readonly createdAt?: Date;
   readonly updatedAt?: Date;
   readonly email?: string;
   name?: string;
   password?: string;
   phone?: string;
   address?: string;
   dob?: Date;
   isSubscribed?: boolean;
   isBlocked?: boolean;
   isVerified?: boolean;
   token?: string;
   profile?: string;
   profileImage?: string;
   gender?: "Male" | "Female" | "Other";
   occupation?: string;
}
