import { Inject, Injectable } from "@nestjs/common";
import { CloudinaryService } from "../../../../configs/cloudinary/cloudinary.service";
import { IServiceFeatureService } from "../interfaces/service-service.interface";
import { CreateServiceDto, CreateSubServiceDto } from "../../dtos/service.dto";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";

@Injectable()
export class ServiceFeatureService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository
    ) { }


    createService(dto: CreateServiceDto) {


    }


}