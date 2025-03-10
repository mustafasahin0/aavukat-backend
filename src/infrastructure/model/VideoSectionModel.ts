import { model, Schema } from "mongoose";
import IVideoSection, { VideoSectionStatus } from "@/domain/entities/IVideoSection";

const videoSectionSchema = new Schema<IVideoSection>(
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
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      status: {
         type: String,
         enum: Object.values(VideoSectionStatus),
         default: VideoSectionStatus.PENDING,
      },
      clientName: { type: String, required: true },
      clientProfile: { type: String },
      lawyerName: { type: String, required: true },
      lawyerProfile: { type: String },
   },
   {
      timestamps: true,
      versionKey: false,
      minimize: false,
   }
);

const VideoSectionModel = model<IVideoSection>("VideoSection", videoSectionSchema);
export default VideoSectionModel;
