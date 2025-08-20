import { Inject, Injectable } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { ISeedAdminService } from '../interface/seed-service.interface';
import { ADMIN_SEED_SERVICE_NAME } from '@core/constants/service.constant';

@Console()
@Injectable()
export class SeedCommand {
  constructor(
    @Inject(ADMIN_SEED_SERVICE_NAME)
    private seedService: ISeedAdminService,
  ) { }

  @Command({
    command: 'seed:admin',
    description: 'Seed the initial admin user',
    options: [
      {
        flags: '-e, --email <email>',
        required: false,
        description: 'Admin email (default: admin@gmail.com)',
      },
      {
        flags: '-p, --password <password>',
        required: false,
        description: 'Admin password (default: admin@123)',
      },
    ],
  })
  async seedAdmin(options?: { email: string, password: string }) {
    try {
      console.log('Starting admin seeding process...');

      if (options?.email) {
        process.env.ADMIN_EMAIL = options.email;
      }

      if (options?.password) {
        process.env.ADMIN_PASSWORD = options.password;
      }

      const admin = await this.seedService.seedAdmin();
      if (!admin) throw new Error('Failed to create admin.');

      console.log('Admin seeded successfully');
    } catch (error) {
      console.error('Error seeding admin:', error);
      process.exit(1);
    }
  }
}
