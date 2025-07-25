import { CloudinaryModule } from '@configs/cloudinary/cloudinary.module';
import { JwtConfigModule } from '@configs/jwt/jwt.module';
import { CustomerController } from '@modules/customer/controllers/customer.controller';
import { customerRepositoryProviders } from '@modules/customer/providers/repository.provider';
import { customerServiceProviders } from '@modules/customer/providers/service.provider';
import { customerUtilityProviders } from '@modules/customer/providers/utility.provider';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';

@Module({
    imports: [JwtConfigModule, HttpModule, CloudinaryModule.registerAsync(), SharedModule],
    controllers: [CustomerController],
    providers: [
        ...customerRepositoryProviders,
        ...customerServiceProviders,
        ...customerUtilityProviders
    ],
    exports: [...customerUtilityProviders]
})
export class CustomerModule {

}