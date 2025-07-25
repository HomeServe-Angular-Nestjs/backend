import { Provider } from '@nestjs/common';

import { TOKEN_SERVICE_NAME } from './core/constants/service.constant';
import { LoggerFactory } from './core/logger/implementation/logger.factory';
import { LOGGER_FACTORY } from './core/logger/interface/logger-factory.interface';
import { TokenService } from './modules/auth/services/implementations/token.service';

export const appProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService,
    },
    {
        provide: LOGGER_FACTORY,
        useClass: LoggerFactory
    }
];