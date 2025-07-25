export interface ICustomLogger {
    log(message: string): void;
    warn(message: string): void;
    debug(message: string | object): void;
    error(message: string, trace?: string, stack?: string | object): void;
}
export const CUSTOM_LOGGER = Symbol('CUSTOM_LOGGER');

