import { SlotStatistics } from "@/types/statistics";
import ISlot, { Days, SlotStatus } from "../../entities/ISlot";
import IRepository from "./IRepository";

export default interface ISlotRepository extends IRepository<ISlot> {
   createMany(slots: ISlot[]): Promise<void>;
   deleteMany(slotIds: string[]): Promise<void>;
   findSlotIdsByStartTimes(lawyerId: string, startTimes: string[], day: Days): Promise<string[]>;
   findMany(lawyerId: string): Promise<ISlot[] | null>;
   findManyByDay(lawyerId: string, day: Days, status?: SlotStatus): Promise<ISlot[] | null>;
   findById(slotId: string): Promise<ISlot | null>;
   findManyByDaysAndTimes(lawyerId: string, days: Days[], startTimes: string[]): Promise<ISlot[] | null>;
   findManyNotInSlotIds(lawyerId: string, day: Days, excludedSlotIds: string[]): Promise<ISlot[] | null>;
   getSlotUsageCount(): Promise<SlotStatistics[]>;
}
