import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { ServiceController } from './controllers/service.controller';
import { serviceProviders } from './providers/service.provider';
import { repositoryProviders } from './providers/repository.provider';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { utilityProviders } from './providers/utility.provider';
import { ProviderController } from './controllers/provider.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule],
  providers: [...serviceProviders, ...repositoryProviders, ...utilityProviders],
  controllers: [ServiceController, ProviderController,],
})
export class ProviderModule { }
