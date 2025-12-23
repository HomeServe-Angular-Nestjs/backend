import { CATEGORY_SERVICE_NAME } from "@core/constants/service.constant";
import { CategoryService } from "@modules/category/services/implementations/category.service";

export const categoryServiceProviders = [
    {
        provide: CATEGORY_SERVICE_NAME,
        useClass: CategoryService
    }
];