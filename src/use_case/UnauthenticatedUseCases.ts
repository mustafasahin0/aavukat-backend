import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import ILawyer from "@/domain/entities/ILawyer";
import { PaginatedResult } from "../types";
import { UserRole } from "@/domain/types/UserRole";

export default class UnauthenticatedUseCases {
   constructor(private lawyerRepository: ILawyerRepository) {}

   async getLawyers(options?: { highestRank?: boolean; limit?: number; offset?: number }): Promise<PaginatedResult<ILawyer>> {
      const isVerified = true;
      const isBlocked = false;
      const limit = options?.limit ?? 100;
      const offset = options?.offset ?? 0;
      
      const data = await this.lawyerRepository.findMany(offset, limit, isVerified, isBlocked);
      data.items = data.items.filter((item) => item.role !== UserRole.Admin);
      
      if (options?.highestRank) {
         // Sort lawyers by rating in descending order
         data.items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      
      return data;
   }

   async getLawyerById(id: string): Promise<ILawyer | null> {
      const lawyer = await this.lawyerRepository.findById(id);
      
      // Only return verified and unblocked lawyers
      if (lawyer && lawyer.isVerified && !lawyer.isBlocked && lawyer.role !== UserRole.Admin) {
         return lawyer;
      }
      
      return null;
   }
}
