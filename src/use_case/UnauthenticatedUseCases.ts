import ILawyerRepository from "@/domain/interface/repositories/ILawyerRepository";
import ILawyer from "@/domain/entities/ILawyer";
import { PaginatedResult } from "../types";
import { UserRole } from "@/domain/types/UserRole";

export default class UnauthenticatedUseCases {
   constructor(private lawyerRepository: ILawyerRepository) {}

   async getLawyers(): Promise<PaginatedResult<ILawyer>> {
      const isVerified = true;
      const isBlocked = false;
      const data = await this.lawyerRepository.findMany(0, 100, isVerified, isBlocked);
      data.items = data.items.filter((item) => item.role !== UserRole.Admin);
      return data;
   }
}
