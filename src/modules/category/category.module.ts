import { Module } from "@nestjs/common";
import { CategoryController } from "./controllers/category.controller";
import { categoryRepositoryProvider } from "@modules/category/provider/category-repository.provider";
import { categoryServiceProviders } from "@modules/category/provider/category-service.provider";
import { SharedModule } from "@shared/shared.module";

@Module({
    imports: [SharedModule],
    controllers: [CategoryController],
    providers: [
        ...categoryRepositoryProvider,
        ...categoryServiceProviders,
    ],
})
export class CategoryModule { }
