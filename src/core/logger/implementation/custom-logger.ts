import { Injectable, Logger } from '@nestjs/common';

import { ICustomLogger } from '../interface/custom-logger.interface';

@Injectable()
export class CustomLogger extends Logger implements ICustomLogger {
    constructor(private readonly _context: string = 'App') {
        super(_context);
    }

    override log(message: string) {
        super.log(message);
    }

    override warn(message: string) {
        super.warn(message);
    }

    override error(message: string, trace?: string, stack?: any) {
        super.error(message, trace, stack);
    }

    override debug(message: any) {
        super.debug(message);
    }
}
