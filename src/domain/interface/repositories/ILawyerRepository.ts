import { PaginatedResult } from "@/types";
import ILawyer from "@/domain/entities/ILawyer";

export default interface ILawyerRepository {
   findById(id: string): Promise<ILawyer | null>;
   findByEmail(email: string): Promise<ILawyer | null>;
   findByEmailWithCredentials(email: string): Promise<ILawyer | null>;
   findMany(
      offset: number,
      limit: number,
      isVerified?: boolean,
      isBlocked?: boolean
   ): Promise<PaginatedResult<ILawyer>>;
   create(lawyer: ILawyer): Promise<ILawyer>;
   update(id: string, lawyer: ILawyer): Promise<void>;
   updateById(id: string, data: Partial<ILawyer>): Promise<void>;
   deleteById(id: string): Promise<void>;
   getCountInTimeRange(startTime: Date, endTime: Date): Promise<number>;
}
