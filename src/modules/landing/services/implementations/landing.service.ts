import { Inject, Injectable } from '@nestjs/common';
import { LANDING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { UPLOAD_UTILITY_NAME } from '@core/constants/utility.constant';
import { IUploadsUtility } from '@core/utilities/interface/upload.utility.interface';
import { IResponse, prepareResponse } from '@core/misc/response.util';
import { ILandingData, ILandingSearchCategory } from '@core/entities/interfaces/landing.entity.interface';
import { ILandingRepository } from '@modules/landing/repositories/interfaces/landing-repository.interface';
import { ILandingService } from '@modules/landing/services/interfaces/landing-service.interface';

@Injectable()
export class LandingService implements ILandingService {
    constructor(
        @Inject(LANDING_REPOSITORY_NAME)
        private readonly _landingRepository: ILandingRepository,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadsUtility: IUploadsUtility,
    ) { }

    async getLandingData(): Promise<IResponse<ILandingData>> {
        const [statistics, categories, featuredProviders, testimonials] = await Promise.all([
            this._landingRepository.getStatistics(),
            this._landingRepository.getPopularCategories(),
            this._landingRepository.getFeaturedProviders(),
            this._landingRepository.getTestimonials(),
        ]);

        const providers = featuredProviders.map(provider => ({
            ...provider,
            avatar: provider.avatar
                ? this._uploadsUtility.getSignedImageUrl(provider.avatar, 5)
                : '',
        }));

        const reviewTestimonials = testimonials.map(testimonial => ({
            ...testimonial,
            customerAvatar: testimonial.customerAvatar
                ? this._uploadsUtility.getSignedImageUrl(testimonial.customerAvatar, 140)
                : '',
        }));

        return prepareResponse(true, 'Landing data fetched successfully.', {
            statistics,
            categories,
            featuredProviders: providers,
            testimonials: reviewTestimonials,
        });
    }

    async searchCategories(search: string): Promise<IResponse<ILandingSearchCategory[]>> {
        if (!search.trim()) {
            return prepareResponse(true, 'Empty search.', []);
        }

        const categoryDocs = await this._landingRepository.searchCategories(search);
        if (categoryDocs.length === 0) {
            return prepareResponse(true, 'No services matched your search.', []);
        }

        const categories = categoryDocs.map(cat => ({
            categoryId: String(cat._id),
            categoryName: cat.name,
        }));

        return prepareResponse(true, 'Categories fetched successfully.', categories);
    }
}