import { REDIS_CLIENT } from "@configs/redis/redis.module";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IPayload } from "@core/misc/payload.interface";
import { CanActivate, ConflictException, ExecutionContext, Inject } from "@nestjs/common";
import Redis from "ioredis";

export class IsPaymentInitializedGuard implements CanActivate {
    private readonly logger: ICustomLogger;
    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(REDIS_CLIENT)
        private readonly _redis: Redis,
    ) {
        this.logger = this._loggerFactory.createLogger(IsPaymentInitializedGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as IPayload;

        const key = `payment:${user.sub}`;

        // @ts-expect-error
        const wasSet = await this._redis.set(key, 'Payment is in progress', 'NX', 'EX', 120);

        if (!wasSet) {
            this.logger.error(`Payment for user ${user.sub} is already in progress.`);
            throw new ConflictException({
                code: ErrorCodes.PAYMENT_IN_PROGRESS,
                message: ErrorMessage.PAYMENT_IN_PROGRESS,
            });
        }

        return true;
    }
} 