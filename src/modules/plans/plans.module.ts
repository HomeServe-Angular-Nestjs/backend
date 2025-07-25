import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { PlanController } from './controllers/plans.controller';
import { planRepositoryProvider } from './providers/plan-repo.provider';
import { planServiceProviders } from './providers/plan-service.providers';

@Module({
    imports: [SharedModule],
    controllers: [PlanController],
    providers: [
        ...planServiceProviders,
        ...planRepositoryProvider
    ]
})
export class PlanModule { }