import { ISlotUI } from '@core/entities/interfaces/booking.entity.interface';
import { ICustomerProviderDetails, IDisplayReviews, IProvider, IProviderCardWithPagination, UserType } from '@core/entities/interfaces/user.entity.interface';
import { UploadsType } from '@core/enum/uploads.enum';
import { IResponse } from '@core/misc/response.util';
import { FilterDto, SlotDto, UpdateBioDto } from '@modules/providers/dtos/provider.dto';

export interface IProviderServices {
  getProviders(filter: FilterDto): Promise<IResponse<IProviderCardWithPagination>>;
  getReviews(providerId: string, count: number): Promise<IResponse<IDisplayReviews>>;
  fetchOneProvider(providerId: string): Promise<IResponse<ICustomerProviderDetails>>;
  bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider>;
  updateBio(providerId: string, updateBioDto: UpdateBioDto): Promise<IResponse<IProvider>>;
  uploadCertificate(providerId: string, label: string, file: Express.Multer.File): Promise<IResponse<IProvider>>;
  updateDefaultSlot(slot: SlotDto, providerId: string): Promise<IProvider>;
  partialUpdate(providerId: string, updateData: Partial<IProvider>): Promise<IProvider>;
  removeCertificate(providerId: string, docId: string): Promise<IResponse<IProvider>>;
  deleteDefaultSlot(id: string): Promise<void>;
  getWorkImages(providerId: string): Promise<IResponse<string[]>>;
  uploadWorkImage(providerId: string, userType: UserType, uploadType: UploadsType, file: Express.Multer.File): Promise<IResponse<string>>;
  updatePassword(providerId: string, currentPassword: string, newPassword: string): Promise<IResponse>;
  fetchAvailableSlotsByProviderId(customerId: string, providerId: string, selectedDate: Date): Promise<IResponse<ISlotUI[]>>;
  updateBufferTime(providerId: string, bufferTime: number): Promise<IResponse<IProvider>>;
  fetchSlotsForReschedule(providerId: string, selectedDate: Date, totalDurationInMinutes: number): Promise<IResponse<ISlotUI[]>>;
}