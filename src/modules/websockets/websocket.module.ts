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
import { ReservationGateway } from '@modules/websockets/namespaces/reservation.gateway';
import { VideoCallGateway } from '@modules/websockets/namespaces/video-call.gateway';

@Module({
    imports: [JwtConfigModule, SharedModule],
    controllers: [ChatController, MessagesController, NotificationController],
    providers: [
        ChatGateway,
        NotificationGateway,
        ReservationGateway,
        VideoCallGateway,
        ...socketServiceProviders,
        ...socketRepositoryProviders,
        ...socketUtilityProviders,
    ],
    exports: [
        NotificationGateway,
        ...socketServiceProviders,
    ],
})
export class WebSocketModule { }