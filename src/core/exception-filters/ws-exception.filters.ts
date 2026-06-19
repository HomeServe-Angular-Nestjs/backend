import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ArgumentsHost, BadRequestException, Catch, ConflictException, Inject, NotFoundException, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(BadRequestException, WsException, ConflictException, NotFoundException)
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
        if (exception instanceof BadRequestException || exception instanceof NotFoundException || exception instanceof ConflictException) {
            client.emit('error', {
                type: exception instanceof NotFoundException ? 'not_found' : 'validation',
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
