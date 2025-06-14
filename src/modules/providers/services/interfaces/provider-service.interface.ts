import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { FilterDto, SlotDto, UpdateDefaultSlotsDto } from '../../dtos/provider.dto';

export interface IProviderServices {
  getProviders(filter?: FilterDto): Promise<IProvider[]>;
  bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider>;
  partialUpdate(id: string, updateData: Partial<IProvider>): Promise<IProvider>;
  fetchOneProvider(id: string): Promise<IProvider>;
  updateDefaultSlot(slot: SlotDto, providerId: string): Promise<IProvider>;
  deleteDefaultSlot(id: string): Promise<void>;
}
