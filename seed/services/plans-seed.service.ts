import { PLAN_REPOSITORY_INTERFACE_NAME } from "@core/constants/repository.constant";
import { ICreatePlan } from "@core/entities/interfaces/plans.entity.interface";
import { ErrorMessage } from "@core/enum/error.enum";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { IPlanRepository } from "@core/repositories/interfaces/plans-repo.interface";
import { Inject, Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";

const PLAN_SEED_DATA: ICreatePlan[] = [
    {
        "name": "free",
        "price": 0,
        "duration": "lifetime",
        "role": "provider",
        "features": [
            "Basic support ",
            "List up to 5 services",
            "No analytics or insights dashboard",
            "Listed after premium providers in search results"
        ],
        "isActive": true,
        "isDeleted": false
    },
    {
        "name": "premium",
        "price": 899,
        "duration": "monthly",
        "role": "provider",
        "features": [
            "List unlimited services",
            "Serve multiple cities or service zones",
            "Listed before basic providers in search results",
            "Full analytics and insights dashboard"
        ],
        "isActive": true,
        "isDeleted": false
    },
    {
        "name": "premium",
        "price": 1299,
        "duration": "yearly",
        "role": "provider",
        "features": [
            "List unlimited services",
            "Serve multiple cities or service zones",
            "Listed before basic providers in search results",
            "Full analytics and insights dashboard"
        ],
        "isActive": true,
        "isDeleted": false
    },
    {
        "name": "free",
        "price": 0,
        "duration": "lifetime",
        "role": "customer",
        "features": [
            "adfsdf"
        ],
        "isActive": true,
        "isDeleted": false
    },
    {
        "name": "premium",
        "price": 499,
        "duration": "monthly",
        "role": "customer",
        "features": [
            "dafd"
        ],
        "isActive": true,
        "isDeleted": false
    },
    {
        "name": "premium",
        "price": 999,
        "duration": "yearly",
        "role": "customer",
        "features": [
            "adfsdfasdf",
            "lkjlkjl;kj"
        ],
        "isActive": true,
        "isDeleted": false
    }
];

const REQUIRED_PLANS_COUNT = PLAN_SEED_DATA.length;

@Injectable()
export class PlanSeedService implements OnModuleInit {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(PLAN_REPOSITORY_INTERFACE_NAME)
        private readonly _planRepository: IPlanRepository,
    ) {
        this.logger = this._loggerFactory.createLogger(PlanSeedService.name);
    }

    async onModuleInit() {
        const count = await this._planRepository.countDocuments();

        if (count < REQUIRED_PLANS_COUNT) {
            this.logger.warn(
                `Plan count is ${count}, but expected ${REQUIRED_PLANS_COUNT}. Synchronizing plans...`,
            );

            for (const plan of PLAN_SEED_DATA) {
                const filter = {
                    name: plan.name,
                    role: plan.role,
                    duration: plan.duration
                }

                const updated = await this._planRepository.upsertPlan(filter, plan);

                if (!updated) {
                    this.logger.error(
                        `Failed to upsert plan: ${plan.name} (${plan.role}, ${plan.duration})`,
                    );
                    throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
                }

            }

        } else {
            this.logger.log('Plans already exist, skipping seeding');
        }
    }
}