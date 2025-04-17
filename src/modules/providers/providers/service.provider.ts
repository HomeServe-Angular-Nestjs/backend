import { Provider } from "@nestjs/common";
import { SERVICE_SERVICE_NAME, TOKEN_SERVICE_NAME } from "../../../core/constants/service.constant";
import { ServiceFeatureService } from "../services/implementations/service.service";
import { TokenService } from "../../auth/services/implementations/token.service";

export const serviceProviders: Provider[] = [
    {
        provide: SERVICE_SERVICE_NAME,
        useClass: ServiceFeatureService
    },
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    },
]