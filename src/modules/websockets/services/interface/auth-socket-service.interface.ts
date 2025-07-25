import { Socket } from 'socket.io';

import { IPayload } from '@core/misc/payload.interface';

export interface IAuthSocketService {
    extractTokenFromCookie(client: Socket): string;
    validateToken(token: string): Promise<IPayload>;
    validateTokenWithRetry(token: string, retries?: number, delayMs?: number): Promise<IPayload>;
}
