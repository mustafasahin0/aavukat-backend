import { NextFunction, Response } from "express";
import { CustomRequest, StatusCode } from "@/types";
import { Days } from "@/domain/entities/ISlot";
import CreateSlotUseCase from "@/use_case/slot/CreateSlotUseCase";
import UpdateSlotUseCase from "@/use_case/slot/UpdateSlotUseCase";
import GetSlotUseCase from "@/use_case/slot/GetSlotUseCase";
import DeleteSlotUseCase from "@/use_case/slot/DeleteSlotUseCase";

export default class SlotController {
   constructor(
      private createSlotUseCase: CreateSlotUseCase,
      private updateSlotUseCase: UpdateSlotUseCase,
      private getSlotUseCase: GetSlotUseCase,
      private deleteSlotUseCase: DeleteSlotUseCase
   ) {}

   async createManyByDay(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id;
         const { slots, day } = req.body;

         await this.createSlotUseCase.createManyByDay(lawyerId!, slots, day);
         res.status(StatusCode.Created).json({ message: "Slots created successfully." });
      } catch (error) {
         next(error);
      }
   }

   async createForAllDays(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id!;
         const { startTimes } = req.body;
         await this.createSlotUseCase.createForAllDays(lawyerId, startTimes);
         res.status(StatusCode.Created).json({ message: "Slots created successfully" });
      } catch (error) {
         next(error);
      }
   }

   async deleteSlots(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id;
         const { slots, day } = req.body;
         await this.deleteSlotUseCase.deleteMany(lawyerId!, slots, day);
         res.status(StatusCode.OK).json({ message: "Slots deleted successfully" });
      } catch (error) {
         next(error);
      }
   }

   async deleteForAllDays(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id!;
         const { startTimes } = req.body;

         await this.deleteSlotUseCase.deleteForAllDays(lawyerId, startTimes);
         res.status(StatusCode.OK).json({ message: "Slots Deleted successfully" });
      } catch (error) {
         next(error);
      }
   }

   async update(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const slot = req.body;
         await this.updateSlotUseCase.update(slot);
         res.status(StatusCode.OK).json({ message: "Slot updated successfully" });
      } catch (error) {
         next(error);
      }
   }

   async getAllLawyerSlots(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.lawyer?.id;
         const day = req.query.day as Days;
         let slots;
         if (Object.values(Days).includes(day)) {
            slots = await this.getSlotUseCase.getSlotsByDay(lawyerId!, day);
         } else {
            slots = await this.getSlotUseCase.getAllSlots(lawyerId!);
         }
         res.status(StatusCode.OK).json(slots);
      } catch (error) {
         next(error);
      }
   }

   async getAllSlotsByLawyerId(req: CustomRequest, res: Response, next: NextFunction) {
      try {
         const lawyerId = req.params.lawyerId;
         const date = req.query.date as string;

         const slots = await this.getSlotUseCase.getSlotsByDate(lawyerId, date);
         res.status(StatusCode.OK).json(slots);
      } catch (error) {
         next(error);
      }
   }
}
