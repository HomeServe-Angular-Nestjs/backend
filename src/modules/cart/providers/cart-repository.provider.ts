import { CART_MODEL_NAME } from '@core/constants/model.constant';
import { CART_REPOSITORY_NAME, PROVIDER_SERVICE_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CartRepository } from '@core/repositories/implementations/cart.repository';
import { ProviderServiceRepository } from '@core/repositories/implementations/provider-service.repository';
import type { CartDocument } from '@core/schema/cart.schema';
import type { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

export const cartRepositoryProvider: Provider[] = [
  {
    provide: CART_REPOSITORY_NAME,
    useFactory: (cartModel: Model<CartDocument>) => new CartRepository(cartModel),
    inject: [getModelToken(CART_MODEL_NAME)],
  },
  {
    provide: PROVIDER_SERVICE_REPOSITORY_NAME,
    useClass: ProviderServiceRepository,
  },
];
