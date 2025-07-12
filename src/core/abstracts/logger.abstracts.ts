import { Inject, Logger, LoggerService } from "@nestjs/common";

export abstract class BaseLogger {
    protected readonly logger: LoggerService;

    constructor(
        protected readonly context: string,
        @Inject(Logger) logger: LoggerService
    ) {
        this.logger = logger;
    }
}