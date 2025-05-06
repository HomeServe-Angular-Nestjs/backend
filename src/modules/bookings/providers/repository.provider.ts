import { Provider } from "@nestjs/common";
import { SERVICE_OFFERED_REPOSITORY_NAME } from "../../../core/constants/repository.constant";
import { ServiceDocument } from "../../../core/schema/service.schema";
import { Model } from "mongoose";
import { ServiceOfferedRepository } from "../../../core/repositories/implementations/serviceOffered.repository";
import { getModelToken } from "@nestjs/mongoose";
import { SERVICE_OFFERED_MODEL_NAME } from "../../../core/constants/model.constant";


export const repositoryProviders: Provider[] = [
    {
        provide: SERVICE_OFFERED_REPOSITORY_NAME,
        useFactory: (serviceOfferedModel: Model<ServiceDocument>) =>
            new ServiceOfferedRepository(serviceOfferedModel),
        inject: [getModelToken(SERVICE_OFFERED_MODEL_NAME)],
    },
]