import { IResponse } from '@/core/misc/response.util';
import { ICustomer, IFetchReviews } from '@core/entities/interfaces/user.entity.interface';
import {
    ChangePasswordDto, SubmitReviewDto, UpdateProfileDto, ProviderIdDto
} from '@modules/customer/dtos/customer.dto';

export interface ICustomerService {
    fetchOneCustomer(id: string): Promise<ICustomer | null>;
    partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
    updateSavedProviders(id: string, dto: ProviderIdDto): Promise<ICustomer>;
    searchProviders(search: string): Promise<IResponse>;
    updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>>;
    changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>>;
    changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>>;
    // submitReview(customerId: string, dto: SubmitReviewDto): Promise<IResponse<IFetchReviews>>;
    getProviderGalleryImages(providerId: string): Promise<IResponse<string[]>>;
}