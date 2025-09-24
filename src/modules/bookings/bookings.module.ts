import { Module } from '@nestjs/common';
import { JwtConfigModule } from '../../configs/jwt/jwt.module';
import { SharedModule } from '../../shared/shared.module';
import { BookingsController } from './controllers/bookings.controller';
import { ProviderBookingsController } from './controllers/provider-bookings.controller';
import { repositoryProviders } from './providers/repository.provider';
import { serviceProviders } from './providers/service.provider';
import { bookingsUtilityProviders } from './providers/utility.provider';
import { PdfModule } from '@core/services/pdf/pdf.module';

@Module({
    imports: [JwtConfigModule, SharedModule, PdfModule],
    controllers: [BookingsController, ProviderBookingsController],
    providers: [
        ...repositoryProviders,
        ...serviceProviders,
        ...bookingsUtilityProviders
    ],
})
export class BookingsModule { }
