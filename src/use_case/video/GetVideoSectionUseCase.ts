import IVideoSectionRepository from "@/domain/interface/repositories/IVideoSectionRepository";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import IVideoSection, { VideoSectionStatus } from "@/domain/entities/IVideoSection";
import IAppointment, { AppointmentStatus } from "@/domain/entities/IAppointment";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import { addDays } from "@/utils/date-formatter";

export default class GetVideoSectionUseCase {
   constructor(
      private readonly videoSectionRepository: IVideoSectionRepository,
      private readonly validatorService: IValidatorService,
      private readonly appointmentRepository: IAppointmentRepository
   ) {}

   async getSectionById(id: string): Promise<IVideoSection | null> {
      this.validatorService.validateIdFormat(id);
      return await this.videoSectionRepository.findById(id);
   }

   async getSectionsByLawyerId(lawyerId: string): Promise<IVideoSection[] | []> {
      const limit = 10;
      const startTime = new Date();
      const sections = await this.videoSectionRepository.findAllSectionsByLawyerId(
         lawyerId,
         startTime as unknown as string,
         VideoSectionStatus.PENDING,
         limit
      );
      return sections ? sections : [];
   }

   async getSectionInOneDayLawyer(lawyerId: string): Promise<IVideoSection[] | []> {
      this.validatorService.validateIdFormat(lawyerId);
      const currentTime = new Date();
      const afterOneDay = addDays(currentTime, 2);
      const sections = await this.videoSectionRepository.findByStartTimeRangeByLawyerId(
         currentTime.toISOString(),
         afterOneDay.toISOString(),
         lawyerId
      );
      const ids = sections?.map((section) => section.appointmentId!.toString()!);
      if (ids && ids?.length > 0) {
         const appointments = await this.appointmentRepository.findManyByIds(ids);
         const filteredSections = this.filterSectionsByAppointmentStatus(sections!, appointments!);
         return filteredSections ?? [];
      }

      return [];
   }

   async getSectionsInOneDayClient(clientId: string): Promise<IVideoSection[] | []> {
      this.validatorService.validateIdFormat(clientId);

      const currentTime = new Date();
      const afterTwoDays = addDays(currentTime, 2);

      const sections = await this.videoSectionRepository.findByStartTimeRangeByClientId(
         currentTime.toISOString(),
         afterTwoDays.toISOString(),
         clientId
      );

      const ids = sections?.map((section) => section.appointmentId!.toString());
      if (ids && ids.length > 0) {
         const appointments = await this.appointmentRepository.findManyByIds(ids as string[]);
         const filteredSections = this.filterSectionsByAppointmentStatus(sections!, appointments!);
         return filteredSections ?? [];
      }

      return [];
   }

   private filterSectionsByAppointmentStatus(sections: IVideoSection[], appointments: IAppointment[]): IVideoSection[] {
      const confirmedAppointments = appointments?.filter(
         (appointment) => appointment.status === AppointmentStatus.CONFIRMED
      );
      const confirmedAppointmentsIds = confirmedAppointments?.map((appointment) => appointment._id!.toString());
      return sections?.filter((section) => confirmedAppointmentsIds?.includes(section.appointmentId!.toString()));
   }
}
