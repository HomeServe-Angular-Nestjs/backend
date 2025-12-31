import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller';
import { cartServiceProvider } from './providers/cart-service.provider';
import { cartRepositoryProvider } from './providers/cart-repository.provider';
import { SharedModule } from '@shared/shared.module';
import { cartUtilityProvider } from '@modules/cart/providers/cart-utility.provider';
import { CloudinaryModule } from '@configs/cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule.registerAsync(), SharedModule],
    controllers: [CartController],
    providers: [
        ...cartServiceProvider,
        ...cartRepositoryProvider,
        ...cartUtilityProvider,
    ],
})
export class CartModule { }
