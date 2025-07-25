import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { SchedulesController } from './controllers/schedule.controller';
import { schedulesRepositoryProviders } from './providers/repository.provider';
import { schedulesServiceProviders } from './providers/service.provider';

@Module({
    imports: [SharedModule],
    controllers: [SchedulesController],
    providers: [
        ...schedulesServiceProviders,
        ...schedulesRepositoryProviders
    ]
})
export class SchedulesModule { }