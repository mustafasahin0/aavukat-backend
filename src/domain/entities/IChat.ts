export default interface IChat {
   readonly _id?: string;
   readonly lawyerId?: string;
   readonly clientId?: string;
   readonly createdAt?: Date;
   readonly updatedAt?: Date;
   readonly lawyerName?: string;
   readonly clientName?: string;
   readonly lawyerProfile?: string;
   readonly clientProfile?: string;
   notSeenMessages?: number;
}
