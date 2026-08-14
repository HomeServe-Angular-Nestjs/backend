import { Socket } from 'socket.io';
import { GlobalWsExceptionFilter } from '@/core/exception-filters/ws-exception.filters';
import { ErrorMessage } from '@/core/enum/error.enum';
import { AUTH_SOCKET_SERVICE_NAME, USER_SOCKET_STORE_SERVICE_NAME } from '@/core/constants/service.constant';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Inject, UseFilters, UseInterceptors } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { IAuthSocketService } from '@modules/websockets/services/interface/auth-socket-service.interface';
import { IUserSocketStoreService } from '@modules/websockets/services/interface/user-socket-store-service.interface';

export interface IClientData {
  id: string;
  type: 'customer' | 'provider';
}

export const corsOption: CorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};

@UseFilters(GlobalWsExceptionFilter)
export abstract class BaseSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  protected readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(AUTH_SOCKET_SERVICE_NAME)
    protected readonly _authSocketService: IAuthSocketService,
    @Inject(USER_SOCKET_STORE_SERVICE_NAME)
    protected readonly _userSocketService: IUserSocketStoreService,
    protected readonly _namespace: string,
    protected readonly _joinRoomOnConnect = false,
  ) {
    this.logger = this._loggerFactory.createLogger(this.constructor.name);
  }

  @UseInterceptors()
  handleConnection(client: Socket) {
    this.logger.debug(`client connected: ${client.id}`);
    this.onClientConnect(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`client disconnected: ${client.id}`);
    this.onClientDisConnect(client);
  }

  protected _roomKey(userId: string): string {
    return `room:${userId}`;
  }

  protected async _authenticate(client: Socket): Promise<void> {
    try {
      const payload = await this._authSocketService.validateToken(client);
      const { sub: userId, type: userType } = payload;

      client.data.user = { id: userId, type: userType };

      await this._userSocketService.addSocket(userId, client.id, this._namespace);

      if (this._joinRoomOnConnect) {
        client.join(this._roomKey(userId));
      }

      this.logger.log(`User ${userId} connected with socket ID: ${client.id} [${this._namespace}]`);
    } catch (error) {
      this.logger.error(ErrorMessage.TOKEN_VERIFICATION_FAILED);
      client.emit('token:expired');
      setTimeout(() => client.disconnect(), 200);
    }
  }

  protected async _unauthenticate(client: Socket): Promise<void> {
    const user = client.data.user;
    if (user?.id) {
      await this._userSocketService.removeSocket(user.id, client.id, this._namespace);
    }
  }

  protected abstract onClientConnect(client: Socket): Promise<void>;
  protected abstract onClientDisConnect(client: Socket): Promise<void>;

  protected _getClient(client: Socket): IClientData {
    return client.data.user;
  }
}
