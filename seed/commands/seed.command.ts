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
  async seedAdmin() {
    try {
      console.log('Starting admin seeding process...');

      const args = process.argv;

      const emailIndex = args.indexOf('-e') + 1;
      const passwordIndex = args.indexOf('-p') + 1;

      const email = args[emailIndex];
      const password = args[passwordIndex];

      if (!email || !password) {
        console.log('Admin email or password is missing');
        process.exit(1);
      }

      const admin = await this.seedService.seedAdmin(email, password);
      if (!admin) throw new Error('Failed to create admin.');

      console.log('Admin seeded successfully');
    } catch (error) {
      console.error('Error seeding admin:', error);
      process.exit(1);
    }
  }
}
