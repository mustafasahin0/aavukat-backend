export default interface IOtp {
   _id?: string;
   email: string;
   code: string;
   expiry: Date;
   createdAt?: Date;
   updatedAt?: Date;
}
