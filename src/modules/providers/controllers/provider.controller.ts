import { Controller, Get, Inject, InternalServerErrorException, UseInterceptors } from "@nestjs/common";
import { AuthInterceptor } from "../../auth/interceptors/auth.interceptor";
import { PROVIDER_SERVICES_NAME } from "../../../core/constants/service.constant";
import { IProviderServices } from "../services/interfaces/provider-service.interface";
import { Provider } from "../../../core/entities/implementation/provider.entity";

@Controller('provider')
export class ProviderController {
    constructor(
        @Inject(PROVIDER_SERVICES_NAME)
        private providerServices: IProviderServices
    ) { }

    @Get('fetch_providers')
    @UseInterceptors(AuthInterceptor)
    async fetchProviders(): Promise<Provider[]> {
        try {
            return await this.providerServices.getProviders();
        } catch (err) {
            throw new InternalServerErrorException('Something happened while fetching providers');
        }
    }
}