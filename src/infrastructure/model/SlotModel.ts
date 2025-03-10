import { model, Schema } from "mongoose";
import ISlot, { Days } from "@/domain/entities/ISlot";

const slotSchema = new Schema<ISlot>(
   {
      lawyerId: {
         type: Schema.Types.ObjectId,
         ref: "Lawyer",
         required: true,
         index: true,
      },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      day: { type: String, enum: Object.values(Days), required: true },
      isAvailable: { type: Boolean, default: true },
   },
   {
      timestamps: true,
      versionKey: false,
      minimize: false,
   }
);

slotSchema.index({ lawyerId: 1, day: 1, startTime: 1 }, { unique: true });

const SlotModel = model<ISlot>("Slot", slotSchema);
export default SlotModel;
