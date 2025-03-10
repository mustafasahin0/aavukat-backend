import INotification from "@/domain/entities/INotification";
import IRepository from "./IRepository";

export default interface INotificationRepository extends IRepository<INotification> {
   findByClientId(clientId: string): Promise<INotification[] | null>;
   findByLawyerId(lawyerId: string): Promise<INotification[] | null>;
   clear(id: string): Promise<void>;
   clearAll(notificationIds: string[]): Promise<void>;
   createMany(notifications: INotification[]): Promise<void>;
   findManyByUserId(userId: string): Promise<INotification[] | null>;
   updateManyToRead(userId: string): Promise<void>;
   getUnreadCount(userId: string): Promise<number>;
}
