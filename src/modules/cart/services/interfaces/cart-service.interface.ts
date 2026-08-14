import type { IResponse } from '@core/misc/response.util';
import type { ICartPopulated } from '@core/entities/interfaces/cart.entity.interface';

export interface ICartService {
  getCart(customerId: string): Promise<IResponse<ICartPopulated>>;
  addItem(customerId: string, providerId: string, providerServiceId: string): Promise<IResponse>;
  removeItem(customerId: string, providerServiceId: string): Promise<IResponse>;
  clearCart(customerId: string): Promise<IResponse>;
}
