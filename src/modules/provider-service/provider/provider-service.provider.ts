import { PROVIDER_OFFER_SERVICE_NAME } from "@core/constants/service.constant";
import { ProviderServiceService } from "../services/implementations/provider-service.service";
import { Provider } from "@nestjs/common";

export const providerServiceServiceProvider: Provider[] = [
    {
        provide: PROVIDER_OFFER_SERVICE_NAME,
        useClass: ProviderServiceService
    }
];
