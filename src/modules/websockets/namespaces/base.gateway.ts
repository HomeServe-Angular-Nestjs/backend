import { Socket } from 'socket.io';

import { GlobalWsExceptionFilter } from '@/core/exception-filters/ws-exception.filters';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@UseFilters(GlobalWsExceptionFilter)
export abstract class BaseSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    protected  logger: ICustomLogger;


    @UseInterceptors()
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
