import { IResponse } from 'src/core/misc/response.util';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { FilterDto, GetProvidersFromLocationSearch, SlotDto, UpdateBioDto, UploadGalleryImageDto } from '../../dtos/provider.dto';
import { UserType } from 'src/modules/auth/dtos/login.dto';
import { UploadsType } from 'src/core/enum/uploads.enum';

export interface IProviderServices {
  getProviders(filter?: FilterDto): Promise<IResponse<IProvider[]>>;
  getProvidersLocationBasedSearch(searchData: GetProvidersFromLocationSearch): Promise<IResponse<IProvider[]>>
  getReviews(providerId: string): Promise<IResponse>;
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
}