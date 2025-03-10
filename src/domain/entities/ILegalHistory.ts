export default interface ILegalHistory {
   id?: string;
   clientId: string;
   lawyerId: string;
   title: string;
   caseType: string;
   description: string;
   date: Date;
   status: string;
   documents?: string[];
   createdAt?: Date;
   updatedAt?: Date;
}
