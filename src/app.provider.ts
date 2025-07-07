import { Provider } from "@nestjs/common";
import { TOKEN_SERVICE_NAME } from "./core/constants/service.constant";
import { TokenService } from "./modules/auth/services/implementations/token.service";
import { APP_FILTER } from "@nestjs/core";
import { GlobalWsExceptionFilter } from "./core/exception-filters/ws-exception.filters";

export const appProviders: Provider[] = [
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService,
    },
    {
        provide: APP_FILTER,
        useClass: GlobalWsExceptionFilter
    },
];