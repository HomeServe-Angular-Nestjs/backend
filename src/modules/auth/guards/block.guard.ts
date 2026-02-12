import { Request } from 'express';

import {
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import {
    BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable,
    Logger, UnauthorizedException
} from '@nestjs/common';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { UserType } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';

@Injectable()
export class BlockGuard implements CanActivate {
    private logger: ICustomLogger;
    private readonly validUserTypes = ['admin', 'customer', 'provider'];

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
    ) {
        this.logger = this.loggerFactory.createLogger(BlockGuard.name);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const isAuthRoute = ['login', 'signup'].some(path => request.path.includes(path));
        if (isAuthRoute) return true;

        const userPayload = request.user as IPayload;
        if (!userPayload?.sub) {
            this.logger.error('User payload missing: Unable to validate authentication.');
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        const userType = (request.headers['x-user-type']) as UserType;

        if (!userType) {
            this.logger.error('User payload missing: Unable to validate authentication.');
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        if (!this.validUserTypes.includes(userType.toLowerCase())) {
            this.logger.error('User payload missing: Unable to validate authentication.');
            throw new BadRequestException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.UNAUTHORIZED_ACCESS
            });
        }

        if (userType === 'admin') {
            return true;
        }

        const repo = userType === 'customer' ? this._customerRepository : this._providerRepository;
        const user: CustomerDocument | ProviderDocument | null = await repo.findById(userPayload.sub);

        if (!user) {
            throw new UnauthorizedException({
                code: ErrorCodes.UNAUTHORIZED_ACCESS,
                message: ErrorMessage.USER_NOT_FOUND
            });
        }
        if (!user.isActive) {
            this.logger.error(`User ${user.id} is Blocked by the admin`);
            throw new ForbiddenException({
                code: ErrorCodes.FORBIDDEN,
                message: ErrorMessage.USER_BLOCKED
            });
        }

        request['userType'] = userType.toLowerCase();

        return true;
    }
} 
