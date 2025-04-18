import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary.provider';

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
