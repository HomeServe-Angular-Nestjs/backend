import { NotificationDocument } from "@core/schema/notification.schema";
import { SendNewNotificationDto } from "@modules/websockets/dto/notification.dto";

// export function getSystemNotificationTemplate(userId: string, data: SendNewNotificationDto): Partial<NotificationDocument> {
//     return {
//         userId,
//         type: data.type,
//         title: data.title,
//         message: data.message,

//     }
// }