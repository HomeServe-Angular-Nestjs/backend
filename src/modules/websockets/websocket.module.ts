import { Module } from '@nestjs/common';
import { ChatGateway } from './namespaces/chat.gateway';
import { socketServiceProviders } from './providers/socket-service.providers';
import { JwtConfigModule } from 'src/configs/jwt/jwt.module';
import { socketRepositoryProviders } from './providers/socket-repository.providers';
import { ChatController } from './controllers/chat.controller';
import { MessagesController } from './controllers/message.controller';
import { socketUtilityProviders } from './providers/socket-utility.providers';

@Module({
    imports: [JwtConfigModule],
    controllers: [ChatController, MessagesController],
    providers: [
        ChatGateway,
        ...socketServiceProviders,
        ...socketRepositoryProviders,
        ...socketUtilityProviders,
    ],
})
export class WebSocketModule { }