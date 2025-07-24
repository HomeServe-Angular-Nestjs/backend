import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "src/core/constants/repository.constant";
import { IUserData, IUserDataWithPagination } from "src/core/entities/interfaces/admin.entity.interface";
import { ICustomerRepository } from "src/core/repositories/interfaces/customer-repo.interface";
import { GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto } from "../../dtos/admin-user.dto";
import { IAdminUserManagementService } from "../interfaces/admin-user-service.interface";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { ICustomer, IProvider } from "src/core/entities/interfaces/user.entity.interface";
import { CustomLogger } from "src/core/logger/custom-logger";

@Injectable()
export class AdminUserManagementService implements IAdminUserManagementService {
    private logger = new CustomLogger(AdminUserManagementService.name);

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository
    ) { }


    /**
      * Retrieves all customers/providers from the database.
      *
      * @returns {Promise<IUserData[]>} List of all customer/provider documents.
      */
    async getusers(page: number = 1, dto: Omit<GetUsersWithFilterDto, 'page'>): Promise<IUserDataWithPagination> {
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
        const [users, total] = await Promise.all([
            repo.find(query, { skip, limit }),
            repo.count(query)
        ]);

        const data: IUserData[] = users.map((user: ICustomer | IProvider) => ({
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
