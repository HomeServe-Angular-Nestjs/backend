import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({})
export class CloudinaryModule {
  static registerAsync(): DynamicModule {
    return {
      module: CloudinaryModule,
      imports: [ConfigModule],
      providers: [CloudinaryProvider, CloudinaryService],
      exports: [CloudinaryProvider, CloudinaryService],
    };
  }
}
