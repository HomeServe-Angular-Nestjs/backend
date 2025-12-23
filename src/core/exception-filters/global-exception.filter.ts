import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory
    ) {
        this.logger = this._loggerFactory.createLogger(GlobalExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'Internal server error';
        let error = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseBody = exception.getResponse();
            if (typeof responseBody === 'object' && responseBody !== null) {
                message = (responseBody as any).message || message;
                error = (responseBody as any).error || error;
            } else {
                message = responseBody as string;
            }
        } else if (exception instanceof Error) {
            this.logger.error(exception.stack || exception.message);
        }

        this.logger.error(`End Point: ${request.url} Status: ${status} Error: ${JSON.stringify(message)}`);

        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message,
                error
            });
    }
}
