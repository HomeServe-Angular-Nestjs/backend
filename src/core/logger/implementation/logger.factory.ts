import { Injectable } from '@nestjs/common';

import { ICustomLogger } from '../interface/custom-logger.interface';
import { ILoggerFactory } from '../interface/logger-factory.interface';
import { CustomLogger } from './custom-logger';

@Injectable()
export class LoggerFactory implements ILoggerFactory {
    createLogger(context: string): ICustomLogger {
        return new CustomLogger(context);
    }
}