import ISlot, { Days, SlotStatus } from "@/domain/entities/ISlot";
import ISlotRepository from "@/domain/interface/repositories/ISlotRepository";
import { SlotStatistics } from "@/types/statistics";
import SlotModel from "../model/SlotModel";

export default class SlotRepository implements ISlotRepository {
   model = SlotModel;

   async createMany(slots: ISlot[]): Promise<void> {
      await this.model.insertMany(slots);
   }

   async deleteMany(slotIds: string[]): Promise<void> {
      await this.model.deleteMany({ _id: { $in: slotIds } });
   }

   async findSlotIdsByStartTimes(lawyerId: string, startTimes: string[], day: Days): Promise<string[]> {
      const slots = await this.model.find({
         lawyerId,
         startTime: { $in: startTimes },
         day,
      });
      return slots.map((slot) => slot._id!);
   }

   async findMany(lawyerId: string): Promise<ISlot[] | null> {
      return await this.model.find({ lawyerId });
   }

   async findManyByDay(lawyerId: string, day: Days, status?: SlotStatus): Promise<ISlot[] | null> {
      const query = status ? { lawyerId, day, status } : { lawyerId, day };
      return await this.model.find(query);
   }

   async findById(slotId: string): Promise<ISlot | null> {
      return await this.model.findById(slotId);
   }

   async findManyByDaysAndTimes(lawyerId: string, days: Days[], startTimes: string[]): Promise<ISlot[] | null> {
      return await this.model.find({
         lawyerId,
         day: { $in: days },
         startTime: { $in: startTimes },
      });
   }

   async findManyNotInSlotIds(lawyerId: string, day: Days, excludedSlotIds: string[]): Promise<ISlot[] | null> {
      return await this.model.find({
         lawyerId,
         day,
         _id: { $nin: excludedSlotIds },
      });
   }

   async getSlotUsageCount(): Promise<SlotStatistics[]> {
      return await this.model.aggregate([
         {
            $group: {
               _id: "$day",
               count: { $sum: 1 },
            },
         },
         {
            $project: {
               _id: 0,
               day: "$_id",
               count: 1,
            },
         },
      ]);
   }

   async create(slot: ISlot): Promise<ISlot> {
      return await this.model.create(slot);
   }

   async update(id: string, slot: ISlot): Promise<ISlot | null> {
      return await this.model.findByIdAndUpdate(id, slot, { new: true });
   }
}
