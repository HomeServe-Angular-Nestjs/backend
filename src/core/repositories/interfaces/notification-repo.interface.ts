import { IBaseRepository } from "@core/repositories/base/interfaces/base-repo.interface";
import { NotificationDocument } from "@core/schema/notification.schema";

export interface INotificationRepository extends IBaseRepository<NotificationDocument> {
    
 }