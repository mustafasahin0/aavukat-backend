import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import ISlot, { Days } from "@/domain/entities/ISlot";
import { addHours } from "@/utils/date-formatter";

export default class GetSlotUseCase {
   constructor(
      private slotRepository: ISlotRepository,
      private appointmentRepository: IAppointmentRepository,
      private validatorService: IValidatorService
   ) {}

   async getAllSlots(lawyerId: string): Promise<ISlot[] | null> {
      this.validatorService.validateIdFormat(lawyerId);
      return await this.slotRepository.findMany(lawyerId);
   }

   async getSlotsByDay(lawyerId: string, day: Days): Promise<ISlot[] | null> {
      this.validatorService.validateEnum(day, Object.values(Days));
      this.validatorService.validateIdFormat(lawyerId);
      return await this.slotRepository.findManyByDay(lawyerId, day);
   }

   async getSlotsByDate(lawyerId: string, date: string): Promise<ISlot[] | []> {
      this.validatorService.validateIdFormat(lawyerId);
      this.validatorService.validateDateFormat(date);

      const dateAfterOneHour = addHours(new Date(), 1);
      const appointments = await this.appointmentRepository.findManyByDateAndLawyerId(date, lawyerId);
      const slotIds = appointments?.map((appointment: any) => appointment.slotId!) || [];
      const day = this.getDayFromDate(date);
      const slots = await this.slotRepository.findManyNotInSlotIds(lawyerId, day, slotIds);

      const isToday = new Date(date).toDateString() === new Date().toDateString();

      // Filter today's slots based on time (slots after the current time + 1 hour)
      return slots
         ? slots
              .sort((a, b) => {
                 const timeA = this.parseTimeStringToDate(a.startTime!);
                 const timeB = this.parseTimeStringToDate(b.startTime!);
                 return timeA.getTime() - timeB.getTime();
              })
              .filter((slot) => {
                 if (isToday) {
                    const startTime = this.parseTimeStringToDate(slot.startTime!);
                    return startTime > dateAfterOneHour;
                 }
                 return true; // Return all slots for future dates
              })
         : [];
   }

   private parseTimeStringToDate(timeString: string): Date {
      const [time, modifier] = timeString.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
   }

   private getDayFromDate(date: string): Days {
      const dayOfWeek = new Date(date).getUTCDay();
      const dayNames = Object.values(Days);
      return dayNames[dayOfWeek] as Days;
   }
}
