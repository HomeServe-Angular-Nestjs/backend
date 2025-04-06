import { Inject, Injectable } from "@nestjs/common";
import { Command, Console } from "nestjs-console";
import { ADMIN_SEED_SERVICE_NAME } from "../../core/constants/service.constant";
import { ISeedAdminService } from "../interface/seed-service.interface";

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
                description: 'Admin email (default: admin@homeserve.com)',
            },
            {
                flags: '-p, --password <password>',
                required: false,
                description: 'Admin password (default: adminHomeServe@123)',
            },
        ],
    })
    async seedAdmin() {
        try {
            console.log('Starting admin seeding process...');
            await this.seedService.seedAdmin();
            console.log('Admin seeded successfully');
        } catch (error) {
            console.error('Error seeding admin:', error.message);
            process.exit(1);
        }
    }

}