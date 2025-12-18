import { Provider } from "@nestjs/common";
import { WEEKLY_AVAILABILITY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { Model } from "mongoose";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";
import { WeeklyAvailabilityRepository } from "@core/repositories/implementations/weekly-availability.repository";
import { getModelToken } from "@nestjs/mongoose";
import { WEEKLY_AVAILABILITY_MODEL_NAME } from "@core/constants/model.constant";

export const availabilityRepositoryProviders: Provider[] = [
    {
        provide: WEEKLY_AVAILABILITY_REPOSITORY_NAME,
        useFactory: (availabilityModel: Model<WeeklyAvailabilityDocument>) =>
            new WeeklyAvailabilityRepository(availabilityModel),
        inject: [getModelToken(WEEKLY_AVAILABILITY_MODEL_NAME)]
    }
]