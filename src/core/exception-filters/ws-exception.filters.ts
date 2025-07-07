import { ArgumentsHost, BadRequestException, Catch, WsExceptionFilter } from "@nestjs/common";

@Catch()
export class GlobalWsExceptionFilter implements WsExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const client = host.switchToWs().getClient();

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