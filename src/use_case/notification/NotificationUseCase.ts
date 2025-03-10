import INotificationRepository from "@/domain/interface/repositories/INotificationRepository";
import IValidatorService from "@/domain/interface/services/IValidatorService";
import INotification from "@/domain/entities/INotification";

export default class NotificationUseCase {
   constructor(
      private notificationRepository: INotificationRepository,
      private validatorService: IValidatorService
   ) {}

   async clearAll(notificationIds: string[]): Promise<void> {
      this.validatorService.validateMultipleIds(notificationIds);
      await this.notificationRepository.clearAll(notificationIds);
   }
   async clearOne(notificationId: string): Promise<void> {
      this.validatorService.validateIdFormat(notificationId);
      await this.notificationRepository.clear(notificationId);
   }

   async getAllClient(clientId: string): Promise<INotification[] | null> {
      this.validatorService.validateIdFormat(clientId);
      return await this.notificationRepository.findByClientId(clientId);
   }
   async getAllLawyer(lawyerId: string): Promise<INotification[] | null> {
      this.validatorService.validateIdFormat(lawyerId);
      return await this.notificationRepository.findByLawyerId(lawyerId);
   }
}
