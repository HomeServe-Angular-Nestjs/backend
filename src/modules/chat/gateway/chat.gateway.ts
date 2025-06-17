import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from 'socket.io'

@WebSocketGateway({ cors: true })
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ChatGateWay.name);

    handleConnection(client: Socket) {
        this.logger.debug(`client connected: ${client.id}`)
    }

    handleDisconnect(client: any) {
        this.logger.debug(`client disconnected: ${client.id}`)
    }

    @SubscribeMessage('chat')
    handleChatMessage(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
        client.broadcast.emit('chat', message);
    }
}