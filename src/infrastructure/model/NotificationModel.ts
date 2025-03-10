import { model, Schema } from "mongoose";
import INotification, { NotificationTypes } from "@/domain/entities/INotification";

const notificationSchema = new Schema<INotification>(
   {
      clientId: {
         type: Schema.Types.ObjectId,
         ref: "Client",
         index: true,
      },
      lawyerId: {
         type: Schema.Types.ObjectId,
         ref: "Lawyer",
         index: true,
      },
      type: {
         type: String,
         enum: Object.values(NotificationTypes),
         required: true,
      },
      message: {
         type: String,
         required: true,
      },
      appointmentId: {
         type: Schema.Types.ObjectId,
         ref: "Appointment",
         required: false,
      },
   },
   {
      timestamps: true,
      versionKey: false,
      minimize: false,
   }
);

const NotificationModel = model<INotification>("Notification", notificationSchema);
export default NotificationModel;
