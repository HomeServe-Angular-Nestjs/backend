import { Provider } from '../../../../core/entities/implementation/provider.entity';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { IPayload } from '../../../../core/misc/payload.interface';
import { FilterDto } from '../../../customer/dtos/customer.dto';
import { UpdateDefaultSlotsDto } from '../../dtos/provider.dto';

export interface IProviderServices {
  getProviders(filter?: FilterDto): Promise<IProvider[]>;
  bulkUpdateProvider(id: string, updateData: Partial<IProvider>, file?: Express.Multer.File,): Promise<IProvider>;
  partialUpdate(id: string, updateData: Partial<IProvider>): Promise<IProvider>;
  fetchOneProvider(id: string): Promise<IProvider>;
  updateDefaultSlot(slot: UpdateDefaultSlotsDto, id: string): Promise<IProvider>;
  deleteDefaultSlot(id: string): Promise<void>;
}
