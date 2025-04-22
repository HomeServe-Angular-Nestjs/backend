import { Provider } from '../../../../core/entities/implementation/provider.entity';
import { IProvider } from '../../../../core/entities/interfaces/user.entity.interface';
import { IPayload } from '../../../auth/misc/payload.interface';

export interface IProviderServices {
  getProviders(): Promise<Provider[]>;
  updateProvider(
    user: IPayload,
    updateData: Partial<IProvider>,
    file: Express.Multer.File,
  ): Promise<Provider>;
  fetchOneProvider(user: IPayload): Promise<IProvider>;
}
