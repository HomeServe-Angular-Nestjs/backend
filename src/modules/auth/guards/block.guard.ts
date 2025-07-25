import { Request } from 'express';

import {
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import { ICustomer, IProvider } from '@core/entities/interfaces/user.entity.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IPayload } from '@core/misc/payload.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { UserType } from '@modules/auth/dtos/login.dto';
import {
    BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable,
    Logger, UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class BlockGuard implements CanActivate {
    private readonly logger: ICustomLogger;
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
            throw new UnauthorizedException('User payload missing: Unable to validate authentication.');
        }

        const userType = (request.headers['x-user-type']) as UserType;

        if (!userType) {
            throw new UnauthorizedException('Missing user type header');
        }

        if (!this.validUserTypes.includes(userType.toLowerCase())) {
            throw new BadRequestException(`Invalid user type: ${userType}`);
        }

        if (userType === 'admin') {
            return true;
        }

        const repo = userType === 'customer' ? this._customerRepository : this._providerRepository;
        const user: ICustomer | IProvider | null = await repo.findById(userPayload.sub);
        if (!user) {
            throw new UnauthorizedException(`User with ID ${userPayload.sub} not found in the database.`);
        }
        if (!user.isActive) {
            this.logger.error(`User ${user.id} is Blocked by the admin`);
            throw new ForbiddenException('You are blocked by the admin.');
        }

        request['userType'] = userType.toLowerCase();

        return true;
    }
} 
