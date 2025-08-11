import { Socket } from 'socket.io';

import { IPayload } from '@core/misc/payload.interface';

export interface IAuthSocketService {
    validateToken(client: Socket): Promise<IPayload>;
}
