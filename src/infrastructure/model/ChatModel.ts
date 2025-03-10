import { model, Schema } from "mongoose";
import IChat from "@/domain/entities/IChat";

const chatSchema = new Schema<IChat>(
   {
      lawyerId: {
         type: Schema.Types.ObjectId,
         ref: "Lawyer",
         required: true,
         index: true,
      },
      clientId: {
         type: Schema.Types.ObjectId,
         ref: "Client",
         required: true,
         index: true,
      },
      lawyerName: {
         type: String,
         required: true,
      },
      clientName: {
         type: String,
         required: true,
      },
      clientProfile: {
         type: String,
         required: true,
      },
      lawyerProfile: {
         type: String,
         required: true,
      },
   },
   {
      timestamps: true,
      versionKey: false,
      minimize: false,
   }
);

chatSchema.index({ lawyerId: 1, clientId: 1 }, { unique: true });
const ChatModel = model<IChat>("Chat", chatSchema);
export default ChatModel;
