import ILawyer from "./ILawyer";
import IClient from "./IClient";
import ISlot from "./ISlot";

export enum AppointmentStatus {
   PAYMENT_PENDING = "payment-pending",
   PENDING = "pending",
   CONFIRMED = "confirmed",
   CANCELLED = "cancelled",
   COMPLETED = "completed",
}

export enum AppointmentType {
   VIDEO_CONSULTING = "video-consulting",
   IN_PERSON = "in-person",
}

export default interface IAppointment {
   readonly _id?: string;
   readonly lawyerId?: string;
   readonly clientId?: string;
   readonly slotId?: string;
   readonly createdAt?: string;
   readonly updatedAt?: string;
   readonly appointmentType?: AppointmentType;
   readonly appointmentDate?: string | Date;
   readonly reason?: string;
   readonly notes?: string;
   readonly paymentId?: string;
   status?: AppointmentStatus;
}

export interface IExtendedAppointment extends IAppointment {
   client?: IClient;
   slot?: ISlot;
   lawyer?: ILawyer;
}
