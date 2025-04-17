import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConsoleModule } from 'nestjs-console';
import { AdminSchema } from '../core/schema/admin.schema';
import { SeedAdminService } from './services/admin-seed.service';
import { ADMIN_MODEL_NAME } from '../core/constants/model.constant';
import { SeedCommand } from './commands/seed.command';
import { ADMIN_SEED_SERVICE_NAME } from '../core/constants/service.constant';
import { ARGON_UTILITY_NAME } from '../core/constants/utility.constant';
import { ArgonUtility } from '../core/utilities/implementations/argon.utility';
import { ADMIN_REPOSITORY_INTERFACE_NAME } from '../core/constants/repository.constant';
import { AdminRepository } from '../core/repositories/implementations/admin.repository';
import { DatabaseModule } from '../configs/database/database.module';

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
      useFactory: (adminModel) => new AdminRepository(adminModel),
      inject: [getModelToken(ADMIN_MODEL_NAME)],
    },
    SeedCommand,
  ],
})
export class SeedsModule {}
