import { Provider } from "@nestjs/common";
import { AUTH_SOCKET_SERVICE_NAME, CHAT_SOCKET_SERVICE_NAME, MESSAGE_SERVICE_NAME, TOKEN_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from "src/core/constants/service.constant";
import { TokenService } from "src/modules/auth/services/implementations/token.service";
import { AuthSocketService } from "../services/implementation/auth-socket.service";
import { ChatSocketService } from "../services/implementation/chat-socket.service";
import { UserSocketStoreService } from "../services/implementation/user-socket-store.service";
import { MessageService } from "../services/implementation/message.service";

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
    }
]