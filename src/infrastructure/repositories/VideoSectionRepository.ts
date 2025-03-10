import IVideoSection, { VideoSectionStatus } from "@/domain/entities/IVideoSection";
import IVideoSectionRepository from "@/domain/interface/repositories/IVideoSectionRepository";
import VideoSectionModel from "../model/VideoSectionModel";

export default class VideoSectionRepository implements IVideoSectionRepository {
   model = VideoSectionModel;

   async create(videoSection: IVideoSection): Promise<IVideoSection> {
      return await this.model.create(videoSection);
   }

   async findByRoomId(roomId: string): Promise<IVideoSection | null> {
      return await this.model.findOne({ roomId });
   }

   async findById(id: string): Promise<IVideoSection | null> {
      return await this.model.findById(id);
   }

   async update(id: string, videoSection: IVideoSection): Promise<IVideoSection | null> {
      return await this.model.findByIdAndUpdate(id, videoSection, { new: true });
   }

   async findByAppointmentId(appointmentId: string): Promise<IVideoSection | null> {
      return await this.model.findOne({ appointmentId });
   }

   async findByAppointmentIdAndUpdate(appointmentId: string, videoSection: IVideoSection): Promise<void> {
      await this.model.findOneAndUpdate({ appointmentId }, videoSection);
   }

   async findByClientIdAndUpdate(clientId: string, section: IVideoSection): Promise<void> {
      await this.model.findOneAndUpdate({ clientId }, section);
   }

   async findByLawyerIdAndUpdate(lawyerId: string, section: IVideoSection): Promise<void> {
      await this.model.findOneAndUpdate({ lawyerId }, section);
   }

   async findByStatus(status: VideoSectionStatus): Promise<IVideoSection | null> {
      return await this.model.findOne({ status });
   }

   async findByStartTimeRangeByLawyerId(
      startTime: string,
      endTime: string,
      lawyerId: string
   ): Promise<IVideoSection[] | null> {
      return await this.model.find({
         lawyerId,
         startTime: { $gte: startTime, $lte: endTime },
      });
   }

   async findByStartTimeRangeByClientId(
      startTime: string,
      endTime: string,
      clientId: string
   ): Promise<IVideoSection[] | null> {
      return await this.model.find({
         clientId,
         startTime: { $gte: startTime, $lte: endTime },
      });
   }

   async findAllSectionsByLawyerId(
      lawyerId: string,
      startTime: string,
      status: VideoSectionStatus,
      limit: number
   ): Promise<IVideoSection[] | null> {
      return await this.model
         .find({
            lawyerId,
            startTime: { $gte: startTime },
            status,
         })
         .limit(limit);
   }

   async delete(id: string): Promise<void> {
      await this.model.findByIdAndDelete(id);
   }
}
