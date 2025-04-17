import { Provider } from "@nestjs/common";
import { SERVICE_SERVICE_NAME } from "../../../core/constants/service.constant";
import { ServiceFeatureService } from "../services/implementations/service.service";

export const serviceProviders: Provider[] = [
    {
        provide: SERVICE_SERVICE_NAME,
        useClass: ServiceFeatureService
}
]