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
    }
]