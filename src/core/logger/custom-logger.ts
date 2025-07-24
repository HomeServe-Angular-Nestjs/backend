import { Logger } from "@nestjs/common";

export class CustomLogger extends Logger {
    constructor(context: string) {
        super(context);
    }

    override log(message: string) {
        super.log(`[MyLog] ${message}`);
    }

    override   warn(message: string) {
        super.warn(`[MyWarn] ${message}`);
    }

    override error(message: string, trace?: string, stack?: any) {
        super.error(`[MyError] ${message}`, trace);
    }

    override debug(message: string, trace?: string, stack?: any) {
        super.debug(`[MyError] ${message}`, trace);
    }
}
