import { PROFESSION_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ProfessionRepository } from "@core/repositories/implementations/profession.repository";
import { ServiceCategoryRepository } from "@core/repositories/implementations/service-category.repository";
import { Provider } from "@nestjs/common";

export const categoryRepositoryProvider: Provider[] = [
    {
        provide: PROFESSION_REPOSITORY_NAME,
        useClass: ProfessionRepository
    },
    {
        provide: SERVICE_CATEGORY_REPOSITORY_NAME,
        useClass: ServiceCategoryRepository
    },
]