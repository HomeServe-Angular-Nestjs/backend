import { Module } from "@nestjs/common";
import { CustomerController } from "./controllers/customer.controller";
import { customerRepositoryProviders } from "./providers/repository.provider";
import { JwtConfigModule } from "../../configs/jwt/jwt.module";
import { customerServiceProviders } from "./providers/service.provider";
import { customerUtilityProviders } from "./providers/utility.provider";
import { HttpModule } from "@nestjs/axios";
import { CloudinaryModule } from "src/configs/cloudinary/cloudinary.module";

@Module({
    imports: [JwtConfigModule, HttpModule, CloudinaryModule.registerAsync()],
    controllers: [CustomerController],
    providers: [
        ...customerRepositoryProviders,
        ...customerServiceProviders,
        ...customerUtilityProviders
    ],
    exports: [...customerUtilityProviders]
})
export class CustomerModule {

}