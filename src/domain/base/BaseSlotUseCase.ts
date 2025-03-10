import { CustomError, StatusCode } from "@/types";
import IValidatorService from "../interface/services/IValidatorService";
import ISlot from "../entities/ISlot";

// Marked as unused by ts-prune, converting to internal interface
// export interface IValidationRule {
//     validator: (value: any) => boolean;
//     message: string;
//     statusCode: StatusCode;
// }

// Using internal interface instead to avoid unused exports
interface IValidationRule {
   validator: (value: any) => boolean;
   message: string;
   statusCode: StatusCode;
}

export default abstract class BaseSlotUseCase {
   constructor(protected validatorService: IValidatorService) {}

   protected validateWithRules(value: any, rules: IValidationRule[]): void {
      for (const rule of rules) {
         if (!rule.validator(value)) {
            throw new CustomError(rule.message, rule.statusCode);
         }
      }
   }

   protected validateSlotStartTimes(slots: ISlot[]): void {
      slots.forEach((slot) => {
         if (!slot.startTime) {
            throw new CustomError(`Missing startTime for slot: ${JSON.stringify(slot)}`, StatusCode.BadRequest);
         }

         this.validateWithRules(slot.startTime, [
            {
               validator: (time) => this.validatorService.validateTimeFormat(time),
               message: "Invalid time format",
               statusCode: StatusCode.BadRequest,
            },
            {
               validator: (time) => this.validatorService.validateLength(time, 7, 11),
               message: "Time string length out of bounds",
               statusCode: StatusCode.BadRequest,
            },
         ]);
      });
   }

   protected validateSlotIds(slotIds: string[]): void {
      this.validateWithRules(slotIds, [
         {
            validator: (ids) => this.validatorService.validateMultipleIds(ids),
            message: "Invalid slot IDs format",
            statusCode: StatusCode.BadRequest,
         },
      ]);
   }

   protected validateSlotId(slotId: string): void {
      this.validateWithRules(slotId, [
         {
            validator: (id) => this.validatorService.validateIdFormat(id),
            message: "Invalid slot ID format",
            statusCode: StatusCode.BadRequest,
         },
      ]);
   }
}
