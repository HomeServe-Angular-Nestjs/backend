import { IServiceCategoryRepository } from "@core/repositories/interfaces/service-category-repo.interface";
import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../base/implementations/base.repository";
import { ServiceCategoryDocument } from "@core/schema/service-category";
import { InjectModel } from "@nestjs/mongoose";
import { SERVICE_CATEGORY_MODEL_NAME } from "@core/constants/model.constant";
import { Model } from "mongoose";

@Injectable()
export class ServiceCategoryRepository extends BaseRepository<ServiceCategoryDocument> implements IServiceCategoryRepository {
    constructor(
        @InjectModel(SERVICE_CATEGORY_MODEL_NAME)
        private readonly _serviceCategoryModel: Model<ServiceCategoryDocument>
    ) {
        super(_serviceCategoryModel);
    }

    
}
