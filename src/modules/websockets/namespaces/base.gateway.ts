import { Logger, UseFilters } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { GlobalWsExceptionFilter } from "src/core/exception-filters/ws-exception.filters";

@UseFilters(GlobalWsExceptionFilter)
export abstract class BaseSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    protected readonly logger = new Logger(this.constructor.name);

    handleConnection(client: Socket) {
        this.logger.debug(`client connected: ${client.id}`);
        this.onClientConnect(client);
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`client disconnected: ${client.id}`)
        this.onClientDisConnect(client);
    }

    protected abstract onClientConnect(client: Socket): void;
    protected abstract onClientDisConnect(client: Socket): void;
}