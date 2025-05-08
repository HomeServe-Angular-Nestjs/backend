import { Module } from "@nestjs/common";
import { CustomerController } from "./controllers/customer.controller";
import { customerRepositoryProviders } from "./providers/repository.provider";
import { JwtConfigModule } from "../../configs/jwt/jwt.module";
import { customerServiceProviders } from "./providers/service.provider";

@Module({
    imports: [JwtConfigModule],
    controllers: [CustomerController],
    providers: [...customerRepositoryProviders, ...customerServiceProviders],
})
export class CustomerModule {

}