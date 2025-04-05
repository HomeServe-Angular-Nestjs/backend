import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from '../auth/schema/admin.schema';
import { SeedAdminService } from './services/admin-seed.service';
import { ADMIN_MODEL_NAME } from '../auth/constants/model.constant';
import { SeedCommand } from './commands/seed.command';
import { ADMIN_SEED_SERVICE_NAME } from '../auth/constants/service.constant';
import { ARGON_UTILITY_NAME } from '../auth/constants/utility.constant';
import { ArgonUtility } from '../auth/common/utilities/implementations/argon.utility';
import { ADMIN_REPOSITORY_INTERFACE_NAME } from '../auth/constants/repository.constant';
import { AdminRepository } from '../auth/repositories/implementations/admin.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [
        ConfigModule,
        DatabaseModule,
        ConsoleModule,
        MongooseModule.forFeature([{ name: ADMIN_MODEL_NAME, schema: AdminSchema }]),
    ],
    providers: [
        SeedAdminService,
        {
            provide: ADMIN_SEED_SERVICE_NAME,
            useClass: SeedAdminService
        },
        ArgonUtility,
        {
            provide: ARGON_UTILITY_NAME,
            useClass: ArgonUtility
        },
        AdminRepository,
        {
            provide: ADMIN_REPOSITORY_INTERFACE_NAME,
            useFactory: (adminModel) => new AdminRepository(adminModel),
            inject: [getModelToken(ADMIN_MODEL_NAME)],
        },
        SeedCommand,
    ],
})
export class SeedsModule { }