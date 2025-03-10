import INotification from "@/domain/entities/INotification";
import INotificationRepository from "@/domain/interface/repositories/INotificationRepository";
import NotificationModel from "../model/NotificationModel";

export default class NotificationRepository implements INotificationRepository {
   model = NotificationModel;

   async create(notification: INotification): Promise<INotification> {
      return await this.model.create(notification);
   }

   async createMany(notifications: INotification[]): Promise<void> {
      await this.model.insertMany(notifications);
   }

   async findById(id: string): Promise<INotification | null> {
      return await this.model.findById(id);
   }

   async update(id: string, notification: INotification): Promise<INotification | null> {
      return await this.model.findByIdAndUpdate(id, notification);
   }

   async findByClientId(clientId: string): Promise<INotification[] | null> {
      return await this.model.find({ clientId }).sort({ createdAt: -1 });
   }

   async findByLawyerId(lawyerId: string): Promise<INotification[] | null> {
      return await this.model.find({ lawyerId }).sort({ createdAt: -1 });
   }

   async findManyByUserId(userId: string): Promise<INotification[] | null> {
      return await this.model.find({ userId }).sort({ createdAt: -1 });
   }

   async updateManyToRead(userId: string): Promise<void> {
      await this.model.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
   }

   async getUnreadCount(userId: string): Promise<number> {
      return await this.model.countDocuments({ userId, isRead: false });
   }

   async clear(id: string): Promise<void> {
      await this.model.findByIdAndDelete(id);
   }

   async clearAll(notificationIds: string[]): Promise<void> {
      await this.model.deleteMany({ _id: { $in: notificationIds } });
   }
}
