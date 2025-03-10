import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import { PaginatedResult, LawyersFilter } from "@/types";
import ILawyer from "@/domain/entities/ILawyer";

export default class AdminLawyerUseCase {
   constructor(private lawyerRepository: ILawyerRepository) {}

   async getAll(offset: number, limit: number, type?: LawyersFilter): Promise<PaginatedResult<ILawyer>> {
      let isVerified: boolean | undefined;
      let isBlocked: boolean | undefined;

      switch (type) {
         case LawyersFilter.VERIFIED:
            isVerified = true;
            isBlocked = false;
            break;
         case LawyersFilter.NOT_VERIFIED:
            isVerified = false;
            isBlocked = false;
            break;
         case LawyersFilter.BLOCKED:
            isBlocked = true;
            break;
         default:
            // Return all lawyers if no filter is specified
            break;
      }

      return await this.lawyerRepository.findMany(offset, limit, isVerified, isBlocked);
   }

   async verifyLawyer(lawyerId: string): Promise<void> {
      await this.lawyerRepository.updateById(lawyerId, { isVerified: true });
   }

   async blockLawyer(lawyerId: string): Promise<void> {
      await this.lawyerRepository.updateById(lawyerId, { isBlocked: true });
   }

   async unblockLawyer(lawyerId: string): Promise<void> {
      await this.lawyerRepository.updateById(lawyerId, { isBlocked: false });
   }
}
