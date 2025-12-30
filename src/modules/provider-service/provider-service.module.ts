import { Module } from "@nestjs/common";
import { ProviderServiceController } from "./controllers/provider-service.controller";
import { providerServiceRepositoryProvider } from "./provider/provider-service-repository.provider";
import { providerServiceServiceProvider } from "./provider/provider-service.provider";
import { SharedModule } from "@shared/shared.module";
import { providerServiceUtility } from "@modules/provider-service/provider/provider-service-utility.provider";
import { CloudinaryModule } from "@configs/cloudinary/cloudinary.module";

@Module({
    imports: [SharedModule, CloudinaryModule.registerAsync()],
    controllers: [ProviderServiceController],
    providers: [
        ...providerServiceRepositoryProvider,
        ...providerServiceServiceProvider,
        ...providerServiceUtility
    ],
    exports: []
})
export class ProviderServiceModule { }
