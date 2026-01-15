import { PAYMENT_LOCKING_UTILITY_NAME } from '@core/constants/utility.constant';
import { ErrorCodes } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { IPaymentLockingUtility } from '@core/utilities/interface/payment-locking.utility';
import { CanActivate, ConflictException, ExecutionContext, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OngoingPaymentGuard implements CanActivate {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(PAYMENT_LOCKING_UTILITY_NAME)
    private readonly _paymentLockingUtility: IPaymentLockingUtility,
  ) {
    this.logger = this._loggerFactory.createLogger(OngoingPaymentGuard.name);
  }

  async canActivate(context: ExecutionContext,): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IPayload;

    const key = this._paymentLockingUtility.generatePaymentKey(user.sub, user.type);
    const isLocked = await this._paymentLockingUtility.isLocked(key);

    if (isLocked) {
      const ttl = await this._paymentLockingUtility.getTTL(key);
      this.logger.warn(`User ${user.sub} has an ongoing payment. TTL remaining: ${ttl}s`);
      throw new ConflictException({
        code: ErrorCodes.PAYMENT_IN_PROGRESS,
        message: `We are still processing your previous payment. Please try again in ${ttl} seconds.`,
        ttl,
      });
    }

    return true;
  }
}
