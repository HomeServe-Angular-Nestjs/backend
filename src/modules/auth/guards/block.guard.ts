import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IPayload } from "src/core/misc/payload.interface";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { UserType } from "../dtos/login.dto";
import { ICustomer, IProvider } from "src/core/entities/interfaces/user.entity.interface";

@Injectable()
export class BlockGuard implements CanActivate {
    private readonly logger = new Logger(BlockGuard.name);
    private readonly validUserTypes = ['admin', 'customer', 'provider'];

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
    ) { }

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
            throw new UnauthorizedException('Missing usertype header');
        }

        if (!this.validUserTypes.includes(userType.toLowerCase())) {
            throw new BadRequestException(`Invalid usertype: ${userType}`);
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