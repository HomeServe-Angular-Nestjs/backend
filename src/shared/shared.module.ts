import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { Module } from '@nestjs/common';
import { sharedProviders } from '@shared/shared.provider';

@Module({
    providers: [...sharedProviders],
    exports: [CUSTOM_LOGGER, LOGGER_FACTORY]
})
export class SharedModule { }