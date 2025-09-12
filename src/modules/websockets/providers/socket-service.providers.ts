import {
    AUTH_SOCKET_SERVICE_NAME, CHAT_SOCKET_SERVICE_NAME, MESSAGE_SERVICE_NAME, NOTIFICATION_SERVICE_NAME, TOKEN_SERVICE_NAME,
    USER_SOCKET_STORE_SERVICE_NAME
} from '@/core/constants/service.constant';
import { TokenService } from '@/modules/auth/services/implementations/token.service';
import { AuthSocketService } from '@modules/websockets/services/implementation/auth-socket.service';
import { ChatSocketService } from '@modules/websockets/services/implementation/chat-socket.service';
import { MessageService } from '@modules/websockets/services/implementation/message.service';
import { NotificationService } from '@modules/websockets/services/implementation/notification.service';
import {
    UserSocketStoreService
} from '@modules/websockets/services/implementation/user-socket-store.service';
import { Provider } from '@nestjs/common';

export const socketServiceProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    },
    {
        provide: AUTH_SOCKET_SERVICE_NAME,
        useClass: AuthSocketService
    },
    {
        provide: CHAT_SOCKET_SERVICE_NAME,
        useClass: ChatSocketService
    },
    {
        provide: USER_SOCKET_STORE_SERVICE_NAME,
        useClass: UserSocketStoreService
    },
    {
        provide: MESSAGE_SERVICE_NAME,
        useClass: MessageService
    },
    {
        provide: NOTIFICATION_SERVICE_NAME,
        useClass: NotificationService
    }
]