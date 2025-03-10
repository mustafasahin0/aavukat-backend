export enum VideoSectionStatus {
   PENDING = "pending",
   COMPLETED = "completed",
   CANCELLED = "cancelled",
}

export default interface IVideoSection {
   readonly _id?: string;
   readonly lawyerId?: string;
   readonly clientId?: string;
   readonly appointmentId?: string;
   readonly roomId?: string;
   readonly startTime?: string;
   readonly endTime?: string;
   readonly status?: VideoSectionStatus;
   readonly clientName?: string;
   readonly clientProfile?: string;
   readonly lawyerName?: string;
   readonly lawyerProfile?: string;
   readonly createdAt?: string;
   readonly updatedAt?: string;
}
