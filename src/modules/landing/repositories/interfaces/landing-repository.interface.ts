import { ServiceCategoryDocument } from '@core/schema/service-category';
import {
    ILandingCategory, ILandingFeaturedProvider, ILandingStatistics, ILandingTestimonial
} from '@core/entities/interfaces/landing.entity.interface';

export interface ILandingRepository {
    getStatistics(): Promise<ILandingStatistics>;
    getPopularCategories(): Promise<ILandingCategory[]>;
    getFeaturedProviders(): Promise<ILandingFeaturedProvider[]>;
    getTestimonials(): Promise<ILandingTestimonial[]>;
    searchCategories(text: string): Promise<ServiceCategoryDocument[]>;
}