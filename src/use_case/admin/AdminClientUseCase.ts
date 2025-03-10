import IClientRepository from "@/domain/interface/repositories/IClientRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import IClient from "@/domain/entities/IClient";
import { PaginatedResult, StatusCode } from "@/types";
import CustomError from "@/domain/entities/CustomError";

export default class AdminClientUseCase {
   constructor(
      private clientRepository: IClientRepository,
      private validatorService: IValidatorService
   ) {}

   async getAll(offset: number, limit: number): Promise<PaginatedResult<IClient>> {
      return await this.clientRepository.findMany(offset, limit);
   }

   async blockUnblock(id: string, isBlocked: boolean, adminEmail: string) {
      console.log(adminEmail);
      if (adminEmail === "admin@gmail.com") {
         throw new CustomError("😊This action is Not Allowed to Demo Admin ❌", StatusCode.BadRequest);
      }
      this.validatorService.validateIdFormat(id);
      this.validatorService.validateBoolean(isBlocked);
      return await this.clientRepository.update(id, { isBlocked: !isBlocked });
   }
}
