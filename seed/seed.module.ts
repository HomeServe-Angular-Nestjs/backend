import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConsoleModule } from 'nestjs-console';
import { Model } from 'mongoose';
import { SeedAdminService } from './services/admin-seed.service';
import { SeedCommand } from './commands/seed.command';
import { ADMIN_MODEL_NAME } from '../src/core/constants/model.constant';
import { AdminDocument, AdminSchema } from '../src/core/schema/admin.schema';
import { DatabaseModule } from '../src/configs/database/database.module';
import { ADMIN_SEED_SERVICE_NAME } from '../src/core/constants/service.constant';
import { ArgonUtility } from '../src/core/utilities/implementations/argon.utility';
import { ARGON_UTILITY_NAME } from '../src/core/constants/utility.constant';
import { AdminRepository } from '../src/core/repositories/implementations/admin.repository';
import { ADMIN_REPOSITORY_INTERFACE_NAME } from '../src/core/constants/repository.constant';
import { ADMIN_MAPPER } from '@core/constants/mappers.constant';
import { AdminMapper } from '@core/dto-mapper/implementation/admin.mapper';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { CustomLogger } from '@core/logger/implementation/custom-logger';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    ConsoleModule,
    MongooseModule.forFeature([
      { name: ADMIN_MODEL_NAME, schema: AdminSchema },
    ]),
  ],
  providers: [
    SeedAdminService,
    ArgonUtility,
    AdminRepository,
    SeedCommand,

    {
      provide: ADMIN_SEED_SERVICE_NAME,
      useClass: SeedAdminService,
    },
    {
      provide: ARGON_UTILITY_NAME,
      useClass: ArgonUtility,
    },
    {
      provide: ADMIN_MAPPER,
      useClass: AdminMapper
    },
    {
      provide: CUSTOM_LOGGER,
      useClass: CustomLogger
    },
    {
      provide: LOGGER_FACTORY,
      useClass: LoggerFactory
    },
    {
      provide: ADMIN_REPOSITORY_INTERFACE_NAME,
      useFactory: (adminModel: Model<AdminDocument>) =>
        new AdminRepository(adminModel),
      inject: [getModelToken(ADMIN_MODEL_NAME)],
    },
  ],
})
export class SeedsModule { }
