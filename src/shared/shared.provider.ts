import { ADMIN_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import { AdminMapper } from '@core/dto-mapper/implementation/admin.mapper';
import { CustomerMapper } from '@core/dto-mapper/implementation/customer.mapper';
import { ProviderMapper } from '@core/dto-mapper/implementation/provider.mapper';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Provider } from '@nestjs/common';

export const sharedProviders: Provider[] = [
    {
        provide: CUSTOM_LOGGER,
        useClass: CustomLogger,
    },
    {
        provide: LOGGER_FACTORY,
        useClass: LoggerFactory
    },
    {
        provide: ADMIN_MAPPER,
        useClass: AdminMapper
    },
    {
        provide: CUSTOMER_MAPPER,
        useClass: CustomerMapper
    },
    {
        provide: PROVIDER_MAPPER,
        useClass: ProviderMapper
    },
]