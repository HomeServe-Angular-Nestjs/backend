import { ICustomLogger } from './custom-logger.interface';

export interface ILoggerFactory<T = ICustomLogger> {
    createLogger(name: string): T;
}
export const LOGGER_FACTORY = Symbol('LOGGER_FACTORY');