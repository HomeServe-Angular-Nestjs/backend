import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CloudinaryModule } from '../../configs/cloudinary/cloudinary.module';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { SharedModule } from '../../shared/shared.module';
import { ProviderController } from './controllers/provider.controller';
import { ServiceController } from './controllers/service.controller';
import { repositoryProviders } from './providers/repository.provider';
import { serviceProviders } from './providers/service.provider';
import { utilityProviders } from './providers/utility.provider';

@Module({
  imports: [CloudinaryModule.registerAsync(), JwtConfigModule, HttpModule, SharedModule],
  providers: [...serviceProviders, ...repositoryProviders, ...utilityProviders],
  controllers: [ServiceController, ProviderController,],
})
export class ProviderModule { }
