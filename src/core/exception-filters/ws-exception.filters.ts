import { ArgumentsHost, BadRequestException, Catch, Logger, WsExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Catch(BadRequestException, WsException)
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