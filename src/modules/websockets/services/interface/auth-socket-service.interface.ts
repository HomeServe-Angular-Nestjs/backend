import type { Socket } from 'socket.io';

import type { IPayload } from '@core/misc/payload.interface';

export interface IAuthSocketService {
  validateToken(client: Socket): Promise<IPayload>;
}
