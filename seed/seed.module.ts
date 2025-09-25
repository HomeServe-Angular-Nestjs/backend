import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConsoleModule } from 'nestjs-console';
import { Model } from 'mongoose';
import { SeedAdminService } from './services/admin-seed.service';
import { SeedCommand } from './commands/seed.command';
import { ADMIN_MODEL_NAME, PLAN_MODEL_NAME, WALLET_MODEL_NAME } from '@core/constants/model.constant';
import { AdminDocument, AdminSchema } from '@core/schema/admin.schema';
import { DatabaseModule } from '@configs/database/database.module';
import { ADMIN_SEED_SERVICE_NAME, PLAN_SEED_SERVICE_NAME } from '@core/constants/service.constant';
import { ArgonUtility } from '@core/utilities/implementations/argon.utility';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { AdminRepository } from '@core/repositories/implementations/admin.repository';
import { ADMIN_REPOSITORY_INTERFACE_NAME, PLAN_REPOSITORY_INTERFACE_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { ADMIN_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { AdminMapper } from '@core/dto-mapper/implementation/admin.mapper';
import { LoggerFactory } from '@core/logger/implementation/logger.factory';
import { LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { CUSTOM_LOGGER } from '@core/logger/interface/custom-logger.interface';
import { CustomLogger } from '@core/logger/implementation/custom-logger';
import { WalletDocument } from '@core/schema/wallet.schema';
import { WalletRepository } from '@core/repositories/implementations/wallet.repository';
import { WalletMapper } from '@core/dto-mapper/implementation/wallet.mapper';
import { PlanSeedService } from './services/plans-seed.service';
import { PlanDocument } from '@core/schema/plans.schema';
import { PlanRepository } from '@core/repositories/implementations/plan.repository';

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
      provide: ADMIN_REPOSITORY_INTERFACE_NAME,
      useFactory: (adminModel: Model<AdminDocument>) =>
        new AdminRepository(adminModel, new LoggerFactory()),
      inject: [getModelToken(ADMIN_MODEL_NAME)],
    },
    {
      provide: WALLET_REPOSITORY_NAME,
      useFactory: (walletModel: Model<WalletDocument>) =>
        new WalletRepository(new LoggerFactory(), walletModel),
      inject: [getModelToken(WALLET_MODEL_NAME)]
    },
    {
      provide: PLAN_REPOSITORY_INTERFACE_NAME,
      useFactory: (planModel: Model<PlanDocument>) =>
        new PlanRepository(planModel),
      inject: [getModelToken(PLAN_MODEL_NAME)]
    },

    {
      provide: ADMIN_SEED_SERVICE_NAME,
      useClass: SeedAdminService,
    },
    {
      provide: PLAN_SEED_SERVICE_NAME,
      useClass: PlanSeedService
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
      provide: WALLET_MAPPER,
      useClass: WalletMapper
    },
    {
      provide: LOGGER_FACTORY,
      useClass: LoggerFactory
    },

  ],
  exports: [ADMIN_MAPPER]
})
export class SeedsModule { } 
