import {
    BOOKING_REPOSITORY_NAME,
    CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@/core/constants/repository.constant';
import {
    IBookingReportData,
    IReportUserData,
    IReportCustomerMatrix,
    IReportDownloadUserData,
    IReportProviderData,
    IReportProviderMatrix,
    IUserData, IUserDataWithPagination,
    ReportCategoryType
} from '@/core/entities/interfaces/admin.entity.interface';
import { ICustomer, IProvider } from '@/core/entities/interfaces/user.entity.interface';
import { ICustomerRepository } from '@/core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@/core/repositories/interfaces/provider-repo.interface';
import { CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { PDF_SERVICE } from '@core/constants/service.constant';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { createUserReportTableTemplate, IUserTableTemplate } from '@core/services/pdf/mappers/users-report.mapper';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import {
    GetUsersWithFilterDto, RemoveUserDto, StatusUpdateDto,
    UserReportDownloadDto
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
        @Inject(BOOKING_REPOSITORY_NAME)
        private readonly _bookingRepository: IBookingRepository,
        @Inject(CUSTOMER_MAPPER)
        private readonly _customerMapper: ICustomerMapper,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
        @Inject(PDF_SERVICE)
        private readonly _pdfService: IPdfService
    ) {
        this.logger = this.loggerFactory.createLogger(AdminUserManagementService.name);
    }

    private async _generateEnrichedCustomerReport(reportDownloadData: IReportDownloadUserData): Promise<IReportUserData[]> {
        const customers = await this._customerRepository.generateCustomersReport(reportDownloadData);

        const enriched = await Promise.all(
            customers.map(async (customer) => {
                const matrix = await this._bookingRepository.getCustomerReportMatrix(customer.id.toString());
                return {
                    ...customer,
                    ...matrix,
                };
            }),
        );

        return enriched;
    }

    private async _generateEnrichedProviderReport(reportDownloadData: IReportDownloadUserData): Promise<IReportProviderData[]> {
        const providers = await this._providerRepository.generateProviderReport(reportDownloadData);
        const enriched = await Promise.all(
            providers.map(async (provider) => {
                const matrix = await this._bookingRepository.getProviderReportMatrix(provider.id.toString());
                return {
                    ...provider,
                    ...matrix
                };
            }),
        );

        return enriched;
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

    async downloadUserReport(reportFilterData: UserReportDownloadDto): Promise<Buffer> {
        const { category, ...reportDownloadData } = { ...reportFilterData };

        const user: Record<'customer' | 'provider', IReportUserData[] | IReportProviderData[]> = {
            customer: [],
            provider: [],
        };

        const role = (reportFilterData.role ?? '').toLowerCase();
        switch (role) {
            case 'customer':
                user.customer = await this._generateEnrichedCustomerReport(reportDownloadData);
                break;
            case 'provider':
                user.provider = await this._generateEnrichedProviderReport(reportDownloadData);
                break;
            default:
                user.customer = await this._generateEnrichedCustomerReport(reportDownloadData);
                user.provider = await this._generateEnrichedProviderReport(reportDownloadData);
        }

        const customerColumnData = ['Customer ID', 'Email', 'Username', 'Fullname', 'Phone', 'Status', 'Bookings', 'Spend (₹)', 'Refunds (₹)'];
        const providerColumnData = ['Provider ID', 'Email', 'Username', 'Fullname', 'Phone', 'Profession', 'Experience', 'Certified', 'Ratings (avg)', 'Service Listed', 'Reviews', 'Total Bookings', 'Earnings (₹)', 'Refunds (₹)'];

        const tableData: IUserTableTemplate[] = [
            {
                rows: user.customer,
                columns: customerColumnData,
                role: 'customer'
            },
            {
                rows: user.provider,
                columns: providerColumnData,
                role: 'provider'
            },
        ];

        const tables = createUserReportTableTemplate(tableData);
        return this._pdfService.generatePdf(tables, 'Users Report');
    }
}
