import IVideoSection, { VideoSectionStatus } from "../../entities/IVideoSection";
import IRepository from "./IRepository";

export default interface IVideoSectionRepository extends IRepository<IVideoSection> {
   findByClientIdAndUpdate(clientId: string, section: IVideoSection): Promise<void>;
   findByLawyerIdAndUpdate(lawyerId: string, section: IVideoSection): Promise<void>;
   findByAppointmentId(appointmentId: string): Promise<IVideoSection | null>;
   findByStatus(status: VideoSectionStatus): Promise<IVideoSection | null>;
   findByStartTimeRangeByLawyerId(
      startTime: string,
      endTime: string,
      lawyerId: string
   ): Promise<IVideoSection[] | null>;
   findByStartTimeRangeByClientId(
      startTime: string,
      endTime: string,
      clientId: string
   ): Promise<IVideoSection[] | null>;
   findAllSectionsByLawyerId(
      lawyerId: string,
      startTime: string,
      status: VideoSectionStatus,
      limit: number
   ): Promise<IVideoSection[] | null>;
   findByAppointmentIdAndUpdate(appointmentId: string, videoSection: IVideoSection): Promise<void>;
   findByRoomId(roomId: string): Promise<IVideoSection | null>;
}
