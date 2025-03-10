import { Days } from "@/domain/entities/ISlot";
import ISlot from "@/domain/entities/ISlot";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import BaseSlotUseCase from "@/domain/base/BaseSlotUseCase";

export default class CreateSlotUseCase extends BaseSlotUseCase {
   constructor(
      private slotRepository: ISlotRepository,
      validatorService: IValidatorService
   ) {
      super(validatorService);
   }

   async createForDay(lawyerId: string, slots: ISlot[], day: Days): Promise<void> {
      this.validatorService.validateIdFormat(lawyerId);
      this.validateSlotStartTimes(slots);

      await this.slotRepository.createMany(
         slots.map((slot) => ({
            ...slot,
            lawyerId,
            day,
         }))
      );
   }

   async createManyByDay(lawyerId: string, slots: ISlot[], day: Days): Promise<void> {
      this.validatorService.validateIdFormat(lawyerId);
      this.validateSlotStartTimes(slots);

      await this.slotRepository.createMany(
         slots.map((slot) => ({
            ...slot,
            lawyerId,
            day,
         }))
      );
   }

   async createForAllDays(lawyerId: string, startTimes: string[]): Promise<void> {
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
         await this.createManyByDay(lawyerId, slots, day);
      }
   }
}
