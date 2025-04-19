import { Inject, Injectable } from "@nestjs/common";
import { IProviderServices } from "../interfaces/provider-service.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { Provider } from "../../../../core/entities/implementation/provider.entity";

@Injectable()
export class ProviderServices implements IProviderServices {
    constructor(
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository
    ) { }


    async getProviders(): Promise<Provider[]> {
        return await this.providerRepository.find();
    }
}