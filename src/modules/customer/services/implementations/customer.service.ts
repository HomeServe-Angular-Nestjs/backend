import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, SERVICE_OFFERED_REPOSITORY_NAME } from "../../../../core/constants/repository.constant";
import { ICustomerRepository } from "../../../../core/repositories/interfaces/customer-repo.interface";
import { ICustomerService } from "../interfaces/customer-service.interface";
import { ICustomer, ISearchedProviders } from "../../../../core/entities/interfaces/user.entity.interface";
import { ChangePasswordDto, UpdateProfileDto, UpdateSavedProvidersDto } from "../../dtos/customer.dto";
import { ARGON_UTILITY_NAME, UPLOAD_UTILITY_NAME } from "../../../../core/constants/utility.constant";
import { IResponse } from "src/core/misc/response.util";
import { IProviderRepository } from "src/core/repositories/interfaces/provider-repo.interface";
import { ErrorMessage } from "src/core/enum/error.enum";
import { IArgonUtility } from "src/core/utilities/interface/argon.utility.interface";
import { IUploadsUtility } from "src/core/utilities/interface/upload.utility.interface";
import { IServiceOfferedRepository } from "src/core/repositories/interfaces/serviceOffered-repo.interface";
import { Types } from "mongoose";
import { ICustomerSearchServices } from "src/core/entities/interfaces/service.entity.interface";

@Injectable()
export class CustomerService implements ICustomerService {
    private readonly logger = new Logger(CustomerService.name);

    constructor(
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(ARGON_UTILITY_NAME)
        private readonly _argonUtility: IArgonUtility,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility,
        @Inject(SERVICE_OFFERED_REPOSITORY_NAME)
        private readonly _serviceOfferedRepository: IServiceOfferedRepository,
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
        }

        return {
            success: true,
            message: 'success',
            data: result
        }
    }

    async updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>> {
        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            { $set: updateData },
            { new: true }
        );

        this.logger.debug(updateData);

        if (!updatedCustomer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        return {
            success: !!updatedCustomer,
            message: 'update successful',
            data: updatedCustomer
        }
    }

    async changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>> {
        const customer = await this._customerRepository.findById(customerId);
        if (!customer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        const result = await this._argonUtility.verify(customer.password, data.currentPassword);
        if (!result) {
            return {
                success: false,
                message: 'Incorrect current password.'
            }
        }

        const hashedPassword = await this._argonUtility.hash(data.newPassword);

        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            {
                $set: { password: hashedPassword }
            },
            { new: true }
        );

        if (!updatedCustomer) {
            throw new Error('Failed to update password');
        }

        return {
            success: !!updatedCustomer,
            message: 'password changed successfully',
            data: updatedCustomer
        }
    }

    async changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>> {

        const avatarUrl = await this._uploadsUtility.uploadImage(file);

        if (!avatarUrl) {
            throw new InternalServerErrorException(ErrorMessage.FILE_UPLOAD_FAILED);
        }

        const updatedCustomer = await this._customerRepository.findOneAndUpdate(
            { _id: customerId },
            {
                $set: { avatar: avatarUrl }
            },
            { nw: true }
        );

        if (!updatedCustomer) {
            throw new NotFoundException(ErrorMessage.CUSTOMER_NOT_FOUND_WITH_ID, customerId);
        }

        return {
            success: !!updatedCustomer,
            message: 'image updated',
            data: updatedCustomer
        }
    }

    async searchServices(search: string): Promise<IResponse<ICustomerSearchServices[]>> {
        if (!search.trim()) {
            return {
                success: true,
                message: 'empty search.',
                data: []
            };
        }

        const services = await this._serviceOfferedRepository.find({
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { 'subService.title': { $regex: search, $options: 'i' } }
            ],
            isDeleted: false,
            isActive: true
        });

        if (services.length === 0) {
            return {
                success: true,
                message: 'No services matched your search.',
                data: []
            };
        }

        const serviceIdSet = new Set(services.map(s => s.id));

        const providers = await this._providerRepository.find({
            servicesOffered: { $in: [...serviceIdSet].map(id => new Types.ObjectId(id)) }
        });

        const serviceToProviderMap = new Map<string, { providerId: string; offeredServiceIds: string[] }>();

        for (const provider of providers) {
            const offeredServiceIds = provider.servicesOffered.map(id => id.toString());

            for (const serviceId of offeredServiceIds) {
                if (serviceIdSet.has(serviceId) && !serviceToProviderMap.has(serviceId)) {
                    serviceToProviderMap.set(serviceId, {
                        providerId: provider.id,
                        offeredServiceIds
                    });
                }
            }
        }

        const filteredServices = services.map(service => {
            const providerData = serviceToProviderMap.get(service.id);

            return {
                id: service.id,
                title: service.title,
                image: service.image,
                provider: providerData?.providerId as string,
                offeredServiceIds: providerData?.offeredServiceIds ?? []
            };
        });

        return {
            success: true,
            message: 'Services fetched successfully',
            data: filteredServices
        }
    }
}