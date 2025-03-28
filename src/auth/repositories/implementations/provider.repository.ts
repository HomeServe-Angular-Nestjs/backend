import { Injectable } from "@nestjs/common";
import { Provider } from "src/auth/common/entities/provider.entity";
import { BaseRepository } from "src/auth/common/repositories/implementations/base.repository";
import { ProviderDocument } from "src/auth/schema/provider.schema";
import { IProviderRepository } from "../interfaces/provider-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { PROVIDER_MODEL_NAME } from "src/auth/constants/model.constant";
import { Model } from "mongoose";

@Injectable()
export class ProviderRepository extends BaseRepository<Provider, ProviderDocument> implements IProviderRepository {

    constructor(@InjectModel(PROVIDER_MODEL_NAME) private providerModel: Model<ProviderDocument>) {
        super(providerModel)
    }

    protected toEntity(doc: ProviderDocument): Provider {
        return new Provider({

        });
    }
}