import { Module } from '@nestjs/common';
import { LandingController } from '@modules/landing/controllers/landing.controller';
import { landingProviders } from '@modules/landing/providers/landing.providers';
import { SharedModule } from '@shared/shared.module';
import { CloudinaryModule } from '@configs/cloudinary/cloudinary.module';

@Module({
    imports: [SharedModule, CloudinaryModule.registerAsync()],
    controllers: [LandingController],
    providers: [...landingProviders],
})
export class LandingModule { }