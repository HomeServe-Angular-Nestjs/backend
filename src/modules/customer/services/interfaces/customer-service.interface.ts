import type { IResponse } from '@/core/misc/response.util';
import type { ICustomer } from '@core/entities/interfaces/user.entity.interface';
import { IFetchReviews } from '@core/entities/interfaces/user.entity.interface';
import type { ChangePasswordDto, UpdateProfileDto } from '@modules/customer/dtos/customer.dto';
import { SubmitReviewDto } from '@modules/customer/dtos/customer.dto';

export interface ICustomerService {
  fetchOneCustomer(id: string): Promise<ICustomer | null>;
  partialUpdate(id: string, data: Partial<ICustomer>): Promise<ICustomer>;
  toggleFavorite(id: string, providerId: string): Promise<ICustomer>;
  searchProviders(search: string): Promise<IResponse>;
  updateProfile(customerId: string, updateData: UpdateProfileDto): Promise<IResponse<ICustomer>>;
  changePassword(customerId: string, data: ChangePasswordDto): Promise<IResponse<ICustomer>>;
  changeAvatar(customerId: string, file: Express.Multer.File): Promise<IResponse<ICustomer>>;
  // submitReview(customerId: string, dto: SubmitReviewDto): Promise<IResponse<IFetchReviews>>;
  getProviderGalleryImages(providerId: string): Promise<IResponse<string[]>>;
}
