import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { Request, Response } from 'express';
import { IResponse } from '@core/misc/response.util';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';

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
        let message: string | string[] | object = ErrorMessage.INTERNAL_SERVER_ERROR;
        let error: string = ErrorCodes.INTERNAL_SERVER_ERROR;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const responseBody = exception.getResponse();

            if (typeof responseBody === 'string') {
                message = responseBody;
                error = this._defaultCodeForStatus(status);
            } else {
                const body = responseBody as Partial<IResponse> & { error?: string; message?: string | string[] | object };
                message = body.message ?? this._defaultMessageForStatus(status);
                error = body.code ?? body.error ?? this._defaultCodeForStatus(status);
            }
        } else if (exception instanceof Error) {
            this.logger.error(exception.stack || exception.message);
        }

        const clientMessage = this._toClientMessage(status, message);
        const clientError = status === HttpStatus.INTERNAL_SERVER_ERROR ? ErrorCodes.INTERNAL_SERVER_ERROR : error;

        this.logger.error(`End Point: ${request.url} Status: ${status} Error: ${JSON.stringify(message)}`);

        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: clientMessage,
                code: clientError,
                error: clientError
            });
    }

    private _toClientMessage(status: number, message: string | string[] | object): string {
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            return ErrorMessage.INTERNAL_SERVER_ERROR;
        }

        const text = Array.isArray(message)
            ? message.join(', ')
            : typeof message === 'string'
                ? message
                : this._defaultMessageForStatus(status);

        return this._sanitizeMessage(status, text);
    }

    private _sanitizeMessage(status: number, message: string): string {
        if (!message || message === 'Internal server error') {
            return this._defaultMessageForStatus(status);
        }

        // Sanitize database/ORM leak patterns
        const technicalPatterns = [
            /with\s+(ID|id)\s+.+not found/i,
            /not found:\s*[\da-f]{12,}/i,
            /cast to objectid/i,
            /e11000 duplicate key/i,
            /mongoose/i,
            /mongodb/i,
        ];

        if (technicalPatterns.some(p => p.test(message))) {
            return this._defaultMessageForStatus(status);
        }

        if (message === ErrorMessage.DOCUMENT_NOT_FOUND) {
            return 'The requested item was not found.';
        }

        return message;
    }

    private _defaultCodeForStatus(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return ErrorCodes.BAD_REQUEST;
            case HttpStatus.UNAUTHORIZED:
                return ErrorCodes.UNAUTHORIZED_ACCESS;
            case HttpStatus.FORBIDDEN:
                return ErrorCodes.FORBIDDEN;
            case HttpStatus.NOT_FOUND:
                return ErrorCodes.NOT_FOUND;
            case HttpStatus.CONFLICT:
                return ErrorCodes.CONFLICT;
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return ErrorCodes.VALIDATION_FAILED;
            case HttpStatus.TOO_MANY_REQUESTS:
                return ErrorCodes.RATE_LIMIT_EXCEEDED;
            case HttpStatus.SERVICE_UNAVAILABLE:
                return ErrorCodes.SERVICE_UNAVAILABLE;
            default:
                return ErrorCodes.INTERNAL_SERVER_ERROR;
        }
    }

    private _defaultMessageForStatus(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'Please check your input and try again.';
            case HttpStatus.UNAUTHORIZED:
                return ErrorMessage.UNAUTHORIZED_ACCESS;
            case HttpStatus.FORBIDDEN:
                return ErrorMessage.FORBIDDEN_ACTION;
            case HttpStatus.NOT_FOUND:
                return 'The requested item was not found.';
            case HttpStatus.CONFLICT:
                return 'This action conflicts with existing data. Please review and try again.';
            case HttpStatus.UNPROCESSABLE_ENTITY:
                return 'The provided data is invalid. Please check your input.';
            case HttpStatus.TOO_MANY_REQUESTS:
                return 'Too many requests. Please slow down and try again.';
            case HttpStatus.SERVICE_UNAVAILABLE:
                return 'Service is temporarily unavailable. Please try again later.';
            default:
                return ErrorMessage.INTERNAL_SERVER_ERROR;
        }
    }
}
