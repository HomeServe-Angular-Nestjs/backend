import { CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';

import { ErrorMessage } from '@core/enum/error.enum';
import { IResponse } from '@core/misc/response.util';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IAdminReviewService } from '@modules/users/services/interfaces/admin-reviews-service.interface';
import { UpdateReviewStatus } from '@modules/users/dtos/admin-user.dto';

@Injectable()
export class AdminReviewService implements IAdminReviewService {
    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private readonly _providerRepository: IProviderRepository,
        @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
        private readonly _customerRepository: ICustomerRepository,
        @Inject(PROVIDER_MAPPER)
        private readonly _providerMapper: IProviderMapper,
    ) { }

    async updateReviewStatus(updateReviewStatus: UpdateReviewStatus): Promise<IResponse> {
        const updatedProvider = await this._providerRepository.findOneAndUpdate(
            {
                _id: updateReviewStatus.providerId,
                'reviews._id': updateReviewStatus.reviewId,
            },
            {
                $set: {
                    'reviews.$.isActive': !updateReviewStatus.status
                }
            },
            { new: true }
        ); //todo

        if (!updatedProvider) {
            throw new NotFoundException(ErrorMessage.PROVIDER_NOT_FOUND_WITH_ID, updateReviewStatus.providerId);

        }

        return {
            success: true,
            message: updateReviewStatus.status ? 'Review Successfully inactivated.' : 'Review Successfully activated.'
        }
    }

    async reviewOverviews(): Promise<IResponse> {



        return {
            success: true,
            message: 'successfully fetched'
        }
    }
}