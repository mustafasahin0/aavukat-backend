import { Days } from "@/domain/entities/ISlot";
import ISlot from "@/domain/entities/ISlot";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import INotificationRepository from "@/domain/interface/repositories/INotificationRepository";
import BaseSlotUseCase from "@/domain/base/BaseSlotUseCase";
import { NotificationTypes } from "@/domain/entities/INotification";

export default class DeleteSlotUseCase extends BaseSlotUseCase {
   constructor(
      private slotRepository: ISlotRepository,
      private appointmentRepository: IAppointmentRepository,
      validatorService: IValidatorService,
      private notificationRepository: INotificationRepository
   ) {
      super(validatorService);
   }

   async deleteMany(lawyerId: string, slots: ISlot[], day: Days): Promise<void> {
      this.validatorService.validateIdFormat(lawyerId);
      this.validateSlotStartTimes(slots);

      const slotIds = await this.slotRepository.findSlotIdsByStartTimes(
         lawyerId,
         slots.map((slot) => slot.startTime!),
         day
      );

      if (slotIds.length > 0) {
         const appointments = await this.appointmentRepository.findBySlotIds(slotIds);
         if (appointments.length > 0) {
            await this.notificationRepository.createMany(
               appointments.map((appointment) => ({
                  userId: appointment.clientId!,
                  message: "Your appointment has been cancelled due to lawyer unavailability",
                  type: NotificationTypes.APPOINTMENT_CANCELED,
               }))
            );
            await this.appointmentRepository.deleteMany(appointments.map((appointment) => appointment._id!));
         }
         await this.slotRepository.deleteMany(slotIds);
      }
   }

   async deleteForAllDays(lawyerId: string, startTimes: string[]): Promise<void> {
      startTimes.forEach((time) => {
         this.validatorService.validateTimeFormat(time);
         this.validatorService.validateLength(time, 7, 11);
      });

      const days = Object.values(Days);
      const slotsByDay = days.reduce<Record<Days, ISlot[]>>(
         (acc, day) => {
            acc[day] = startTimes.map((startTime) => ({
               startTime,
            }));
            return acc;
         },
         {} as Record<Days, ISlot[]>
      );

      for (const day of days) {
         const slots = slotsByDay[day];
         await this.deleteMany(lawyerId, slots, day);
      }
   }
}
