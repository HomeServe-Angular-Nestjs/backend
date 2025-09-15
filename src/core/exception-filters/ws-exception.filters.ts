import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ArgumentsHost, BadRequestException, Catch, ConflictException, Inject, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(BadRequestException, WsException, ConflictException)
export class GlobalWsExceptionFilter implements WsExceptionFilter {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory
    ) {
        this.logger = this._loggerFactory.createLogger(GlobalWsExceptionFilter.name);
    }

    catch(exception: any, host: ArgumentsHost) {
        const client = host.switchToWs().getClient();

        console.log(exception);

        this.logger.error(exception.message);
        if (exception instanceof BadRequestException) {
            client.emit('error', {
                type: 'validation',
                message: exception.message,
                error: exception.getResponse()
            });
        } else {
            client.emit('error', {
                type: 'unknown',
                message: 'Unexpected error'
            });
        }
    }
}