import type { ICart, ICartPopulated } from '@core/entities/interfaces/cart.entity.interface';
import type { CartDocument, CartPopulatedDocument } from '@core/schema/cart.schema';

export interface ICartMapper {
  toDocument(cart: Omit<ICart, 'id'>): Partial<CartDocument>;
  toEntity(doc: CartDocument): ICart;
  toPopulatedEntity(doc: CartPopulatedDocument): ICartPopulated;
}
