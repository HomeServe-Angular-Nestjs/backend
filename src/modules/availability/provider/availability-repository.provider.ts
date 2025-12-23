import { Provider } from "@nestjs/common";
import { DATE_OVERRIDES_REPOSITORY_NAME, WEEKLY_AVAILABILITY_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { Model } from "mongoose";
import { WeeklyAvailabilityDocument } from "@core/schema/weekly-availability.schema";
import { WeeklyAvailabilityRepository } from "@core/repositories/implementations/weekly-availability.repository";
import { getModelToken } from "@nestjs/mongoose";
import { DATE_OVERRIDE_MODEL_NAME, WEEKLY_AVAILABILITY_MODEL_NAME } from "@core/constants/model.constant";
import { DateOverrideDocument } from "@core/schema/date-overrides.schema";
import { DateOverridesRepository } from "@core/repositories/implementations/date-overrides.repository";

export const availabilityRepositoryProviders: Provider[] = [
    {
        provide: WEEKLY_AVAILABILITY_REPOSITORY_NAME,
        useFactory: (availabilityModel: Model<WeeklyAvailabilityDocument>) =>
            new WeeklyAvailabilityRepository(availabilityModel),
        inject: [getModelToken(WEEKLY_AVAILABILITY_MODEL_NAME)]
    },
    {
        provide: DATE_OVERRIDES_REPOSITORY_NAME,
        useFactory: (overrideModel: Model<DateOverrideDocument>) =>
            new DateOverridesRepository(overrideModel),
        inject: [getModelToken(DATE_OVERRIDE_MODEL_NAME)]
    },
]