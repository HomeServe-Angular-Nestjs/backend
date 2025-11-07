import { IDisplayReviews, IProvider, IProviderCardView } from '@core/entities/interfaces/user.entity.interface';
import { UploadsType } from '@core/enum/uploads.enum';
import { IResponse } from '@core/misc/response.util';
import { UserType } from '@modules/auth/dtos/login.dto';
import {
  FilterDto, GetProvidersFromLocationSearch, SlotDto, UpdateBioDto
} from '@modules/providers/dtos/provider.dto';

export interface IProviderServices {
  getProviders(filter?: FilterDto): Promise<IResponse<IProviderCardView[]>>;
  getProvidersLocationBasedSearch(searchData: GetProvidersFromLocationSearch): Promise<IResponse<IProvider[]>>
  getReviews(providerId: string, count: number): Promise<IResponse<IDisplayReviews>>;
  fetchOneProvider(id: string): Promise<IProvider>;
  bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider>;
  updateBio(providerId: string, dto: UpdateBioDto): Promise<IResponse<IProvider>>;
  uploadCertificate(providerId: string, label: string, file: Express.Multer.File): Promise<IResponse<IProvider>>;
  updateDefaultSlot(slot: SlotDto, providerId: string): Promise<IProvider>;
  partialUpdate(id: string, updateData: Partial<IProvider>): Promise<IProvider>;
  removeCertificate(providerId: string, docId: string): Promise<IResponse<IProvider>>;
  deleteDefaultSlot(id: string): Promise<void>;
  getWorkImages(providerId: string): Promise<IResponse<string[]>>;
  uploadWorkImage(providerId: string, userType: UserType, uploadType: UploadsType, file: Express.Multer.File): Promise<IResponse<string>>;
  updatePassword(providerId: string, currentPassword: string, newPassword: string): Promise<IResponse>;
}