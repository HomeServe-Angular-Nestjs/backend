import { Module } from "@nestjs/common";
import { UploadController } from "./controllers/upload.controller";
import { CloudinaryModule } from "../../configs/cloudinary/cloudinary.module";
import { ServiceController } from "./controllers/service.controller";
import { serviceProviders } from "./providers/service.provider";
import { repositoryProviders } from "./providers/repository.provider";

@Module({
    imports: [
        CloudinaryModule.registerAsync(),

    ],
    providers: [
        ...serviceProviders,
        ...repositoryProviders
    ],
    controllers: [UploadController, ServiceController]
})
export class ProviderModule { }