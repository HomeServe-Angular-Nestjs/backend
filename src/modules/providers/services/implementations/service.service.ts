import { Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { CloudinaryService } from "../../../../configs/cloudinary/cloudinary.service";
import { IServiceFeatureService } from "../interfaces/service-service.interface";
import { CreateServiceDto, CreateSubServiceDto } from "../../dtos/service.dto";
import { IProviderRepository } from "../../../../core/repositories/interfaces/provider-repo.interface";
import { PROVIDER_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { IPayload } from "../../../auth/misc/payload.interface";

@Injectable()
export class ServiceFeatureService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
        private providerRepository: IProviderRepository
    ) { }


    createService(dto: CreateServiceDto, user: IPayload) {
        try {
            const provider = this.providerRepository.findByEmail(user.email);

            if (!provider) {
                throw new UnauthorizedException('The user is not found');
            }

            // const newService = new 
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err
            }
            throw new InternalServerErrorException('Something unexpected happened.');
        }
    }


}