import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ADMIN_REPOSITORY_INTERFACE_NAME } from '../../core/constants/repository.constant';
import { IAdminRepository } from '../../core/repositories/interfaces/admin-repo.interface';
import { ARGON_UTILITY_NAME } from '../../core/constants/utility.constant';
import { IArgonUtility } from '../../core/utilities/interface/argon.utility.interface';
import { Admin } from '../../core/entities/implementation/admin.entity';
import { ISeedAdminService } from '../interface/seed-service.interface';

@Injectable()
export class SeedAdminService implements ISeedAdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY_INTERFACE_NAME)
    private adminRepository: IAdminRepository,
    @Inject(ARGON_UTILITY_NAME)
    private argon: IArgonUtility,
    private config: ConfigService,
  ) {}

  async seedAdmin(): Promise<Admin> {
    try {
      const email =
        this.config.get<string>('ADMIN_EMAIL') || 'admin@homeserve.com';
      const password =
        this.config.get<string>('ADMIN_PASSWORD') || 'adminHomeServe@123';

      const admin = await this.adminRepository.findByEmail(email);

      if (admin) {
        return admin;
      }

      const hashedPassword = await this.argon.hash(password);
      const newAdmin = this.adminRepository.create(
        new Admin({
          email,
          password: hashedPassword,
        }),
      );

      return newAdmin;
    } catch (err) {
      console.error('Error caught while saving the admin: ', err);
      throw new InternalServerErrorException(
        'Something happened when saving admin',
      );
    }
  }
}
