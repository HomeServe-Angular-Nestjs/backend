import { Module } from '@nestjs/common';

import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { SharedModule } from '../../shared/shared.module';
import { ChatController } from './controllers/chat.controller';
import { MessagesController } from './controllers/message.controller';
import { ChatGateway } from './namespaces/chat.gateway';
import { socketRepositoryProviders } from './providers/socket-repository.providers';
import { socketServiceProviders } from './providers/socket-service.providers';
import { socketUtilityProviders } from './providers/socket-utility.providers';
import { NotificationController } from '@modules/websockets/controllers/notification.controller';
import { NotificationGateway } from '@modules/websockets/namespaces/notification.gateway';

@Module({
    imports: [JwtConfigModule, SharedModule],
    controllers: [ChatController, MessagesController, NotificationController],
    providers: [
        ChatGateway,
        NotificationGateway,
        ...socketServiceProviders,
        ...socketRepositoryProviders,
        ...socketUtilityProviders,
    ],
})
export class WebSocketModule { }