import { Injectable } from "@nestjs/common";
import { Provider } from "../../entities/implementation/provider.entity";
import { BaseRepository } from "../base/implementations/base.repository";
import { ProviderDocument } from "../../schema/provider.schema";
import { IProviderRepository } from "../interfaces/provider-repo.interface";
import { InjectModel } from "@nestjs/mongoose";
import { PROVIDER_MODEL_NAME } from "../../constants/model.constant";
import { Model, Types } from "mongoose";

@Injectable()
export class ProviderRepository extends BaseRepository<Provider, ProviderDocument> implements IProviderRepository {

    constructor(@InjectModel(PROVIDER_MODEL_NAME) private providerModel: Model<ProviderDocument>) {
        super(providerModel)
    }

    protected toEntity(doc: ProviderDocument): Provider {
        return new Provider({
            id: (doc._id as Types.ObjectId).toString(),
            email: doc.email,
            username: doc.username,
            password: doc.password,
            googleId: doc.googleId,
            isActive: doc.isActive,
        });
    }
}