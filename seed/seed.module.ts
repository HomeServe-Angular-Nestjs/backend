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
    {
      provide: ADMIN_SEED_SERVICE_NAME,
      useClass: SeedAdminService,
    },
    ArgonUtility,
    {
      provide: ARGON_UTILITY_NAME,
      useClass: ArgonUtility,
    },
    AdminRepository,
    {
      provide: ADMIN_REPOSITORY_INTERFACE_NAME,
      useFactory: (adminModel: Model<AdminDocument>) =>
        new AdminRepository(adminModel),
      inject: [getModelToken(ADMIN_MODEL_NAME)],
    },
    SeedCommand,
  ],
})
export class SeedsModule {}
