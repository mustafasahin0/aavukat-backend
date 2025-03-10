import { Socket, Namespace } from "socket.io";
import NotificationUseCase from "@/use_case/notification/NotificationUseCase";
import CustomError from "@/domain/entities/CustomError";
import { TokenPayload, UserRole } from "@/types";
import logger from "@/utils/logger";

export default class NotificationSocketEvents {
   constructor(
      private io: Namespace,
      private notificationUseCase: NotificationUseCase
   ) {}

   public initializeEvents(socket: Socket) {
      socket.on("getNotifications", () => this.handleErrors(socket, this.getNotifications(socket)));
      socket.on("clearNotification", (notificationId: string) =>
         this.handleErrors(socket, this.clearOne(socket, notificationId))
      );
      socket.on("clearAllNotifications", (notificationIds: string[]) =>
         this.handleErrors(socket, this.clearAll(socket, notificationIds))
      );
   }

   private async getNotifications(socket: Socket) {
      const user = socket.data.user as TokenPayload;
      let notifications;
      if (user.role === UserRole.Client) {
         notifications = await this.notificationUseCase.getAllClient(user.id);
      } else if (user.role === UserRole.Lawyer) {
         notifications = await this.notificationUseCase.getAllLawyer(user.id);
      }
      socket.emit("notifications", notifications);
   }

   private async clearOne(socket: Socket, notificationId: string) {
      await this.notificationUseCase.clearOne(notificationId);
      socket.emit("notificationCleared", notificationId);
   }

   private async clearAll(socket: Socket, notificationIds: string[]) {
      await this.notificationUseCase.clearAll(notificationIds);
      socket.emit("notificationsCleared", notificationIds);
   }

   private async handleErrors(socket: Socket, handler: Promise<void>) {
      try {
         await handler;
      } catch (error) {
         if (error instanceof CustomError) {
            socket.emit("error", error.message);
         } else {
            logger.error("Socket Error:", error);
            socket.emit("error", "Internal server error");
         }
      }
   }
}
