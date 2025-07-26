import {
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@/core/constants/repository.constant';
import {
    IUserData, IUserDataWithPagination
} from '@/core/entities/interfaces/admin.entity.interface';
import { ICustomer, IProvider } from '@/core/entities/interfaces/user.entity.interface';
import { ICustomerRepository } from '@/core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@/core/repositories/interfaces/provider-repo.interface';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import {
    GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto
} from '@modules/users/dtos/admin-user.dto';
import {
    IAdminUserManagementService
} from '@modules/users/services/interfaces/admin-user-service.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminUserManagementService implements IAdminUserManagementService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly loggerFactory: ILoggerFactory,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
    ) {
        this.logger = this.loggerFactory.createLogger(AdminUserManagementService.name);
    }

    async getUsers(page: number = 1, dto: Omit<GetUsersWithFilterDto, 'page'>): Promise<IUserDataWithPagination> {
        const limit = 10;
        const skip = (page - 1) * limit;

        const query: { [key: string]: any | string } = { isDeleted: false };

        if (typeof dto.search === 'string') {
            query.email = new RegExp(dto.search, 'i')
        }

        if (typeof dto.status === 'boolean') {
            query.isActive = dto.status
        }

        const repo = dto.role === 'customer' ? this._customerRepository : this._providerRepository;
        const [userDocuments, total] = await Promise.all([
            repo.find(query, { skip, limit }),
            repo.count(query)
        ]);

        let users: ICustomer[] | IProvider[] = [];
        switch (dto.role) {
            case 'customer':
                users = (userDocuments ?? []).map((user) => this._customerMapper.toEntity(user));
                break;
            case 'provider':
                users = (userDocuments ?? []).map((user) => this._providerMapper.toEntity(user));
                break;
        }

        const data: IUserData[] = (users ?? []).map((user: ICustomer | IProvider) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            contact: user.phone,
            createdAt: user.createdAt as Date,
            isActive: user.isActive,
            isDeleted: user.isDeleted,
        }));

        return { data, pagination: { limit, page, total } }
    }

    async updateUserStatus(dto: StatusUpdateDto): Promise<boolean> {
        const repo = dto.role === 'customer' ? this._customerRepository : this._providerRepository;

        const updatedUser = await repo.findOneAndUpdate(
            { _id: dto.userId },
            { $set: { isActive: !dto.status } },
            { new: true }
        );

        if (!updatedUser) {
            throw new NotFoundException(`${dto.role} with ID ${dto.userId} not found.`);
        }

        return !!updatedUser;
    }

    async removeUser(dto: RemoveUserDto): Promise<boolean> {
        const repo = dto.role === 'customer' ? this._customerRepository : this._providerRepository;

        const deletedUser = await repo.findOneAndUpdate(
            { _id: dto.userId },
            { $set: { isDeleted: true } }
        );

        if (!deletedUser) {
            throw new NotFoundException(`${dto.role} with ID ${dto.userId} not found.`);
        }

        return !!deletedUser;
    }

}
