import { PaginatedResult } from "@/types";
import IClient from "@/domain/entities/IClient";
import IAppointmentRepository from "@/domain/interface/repositories/IAppointmentRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import { IExtendedAppointment } from "@/domain/entities/IAppointment";

export default class GetClientUseCase {
   constructor(
      private appointmentRepository: IAppointmentRepository,
      private validatorService: IValidatorService
   ) {}

   async execute(lawyerId: string, limit: number = 10, offset: number = 0): Promise<PaginatedResult<IClient>> {
      this.validatorService.validateIdFormat(lawyerId);
      return this.appointmentRepository.findClientsByLawyerId(lawyerId, limit, offset);
   }

   async getLegalHistory(
      clientId: string,
      offset: number,
      limit: number
   ): Promise<PaginatedResult<IExtendedAppointment>> {
      this.validatorService.validateIdFormat(clientId);
      return await this.appointmentRepository.findManyAsExtendedByClientId(clientId, limit, offset);
   }
}
