export enum NotificationTypes {
   APPOINTMENT_CANCELED = "appointment_canceled",
   APPOINTMENT_CONFIRMED = "appointment_confirmed",
   APPOINTMENT_REMINDER = "appointment_reminder",
}

export default interface INotification {
   readonly _id?: string;
   readonly clientId?: string;
   readonly lawyerId?: string;
   readonly type?: NotificationTypes;
   readonly message?: string;
   readonly createdAt?: Date;
   readonly updatedAt?: Date;
   readonly appointmentId?: string;
}
