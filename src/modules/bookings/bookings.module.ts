import { Module } from '@nestjs/common';
import { BookingsController } from './controllers/bookings.controller';
import { repositoryProviders } from './providers/repository.provider';
import { serviceProviders } from './providers/service.provider';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { ProviderBookingsController } from './controllers/provider-bookings.controller';

@Module({
    imports: [JwtConfigModule],
    controllers: [BookingsController, ProviderBookingsController],
    providers: [
        ...repositoryProviders,
        ...serviceProviders
    ],
})
export class BookingsModule { }
