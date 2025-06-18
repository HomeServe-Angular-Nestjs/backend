import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { ICustomerService } from "../interfaces/customer-service.interface";
import { ICustomer, ISearchedProviders } from "../../../../core/entities/interfaces/user.entity.interface";
import { UpdateSavedProvidersDto } from "../../dtos/customer.dto";
import { FAST2SMS_UTILITY_NAME } from "../../../../core/constants/utility.constant";
import { IFast2SmsService } from "../../../../core/utilities/interface/fast2sms.interface";
import { IResponse } from "src/core/misc/response.util";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";

@Injectable()
export class CustomerService implements ICustomerService {
    private readonly logger = new Logger(CustomerService.name);

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(FAST2SMS_UTILITY_NAME)
        private readonly _fast2SmsService: IFast2SmsService
    ) { }

    async fetchOneCustomer(id: string): Promise<ICustomer | null> {
        return await this._customerRepository.findOne({ _id: id });
    }

    /**
   * Partially updates customer information.
   *
   * @param {string} id - The customer's unique ID.
   * @param {Partial<ICustomer>} data - The fields to update.
   * @returns {Promise<ICustomer>} The updated customer document.
   * @throws {NotFoundException} If the customer is not found.
   */
    async partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer> {
        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: id },
            { $set: data },
            { new: true }
        );

        if (!updatedCustomer) {
            throw new NotFoundException(`Customer with Id ${id} is not found`)
        }

        return updatedCustomer;
    }

    async updateSavedProviders(id: string, dto: UpdateSavedProvidersDto): Promise<ICustomer> {
        const customers = await this._customerRepository.findById(id);
        const alreadySaved = customers?.savedProviders?.includes(dto.providerId);

        const query = alreadySaved
            ? { $pull: { savedProviders: dto.providerId } }
            : { $addToSet: { savedProviders: dto.providerId } };

        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: id },
            query,
            { new: true }
        );


        if (!updatedCustomer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return updatedCustomer;
    }

    async sendOtp(phone: number): Promise<any> {
        this._fast2SmsService.sendOtp(phone)
    }


    async searchProviders(search: string): Promise<IResponse> {
        let result: ISearchedProviders[] = [];

        if (search) {
            const regex = new RegExp(search, 'i');
            const providers = await this._providerRepository.find({ 'location.address': regex });

            result = providers.map(prov => ({
                id: prov.id,
                avatar: prov.avatar,
                name: prov.fullname ?? prov.username,
                address: prov.location ? prov.location.address : ''
            }));

            this.logger.debug(providers);
        }

        return {
            success: true,
            message: 'success',
            data: result
        }
    }
}