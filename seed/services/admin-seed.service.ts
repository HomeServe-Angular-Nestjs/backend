import { Inject, Injectable, InternalServerErrorException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISeedAdminService } from '../interface/seed-service.interface';
import { ADMIN_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { IAdminRepository } from '@core/repositories/interfaces/admin-repo.interface';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { ADMIN_MAPPER } from '@core/constants/mappers.constant';
import { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { IAdmin } from '@core/entities/interfaces/admin.entity.interface';

@Injectable()
export class SeedAdminService implements ISeedAdminService {
  private logger: ICustomLogger;

  constructor(
    private readonly _config: ConfigService,
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(ADMIN_REPOSITORY_INTERFACE_NAME)
    private readonly _adminRepository: IAdminRepository,
    @Inject(ARGON_UTILITY_NAME)
    private readonly _argon: IArgonUtility,
    @Inject(ADMIN_MAPPER)
    private readonly _adminMapper: IAdminMapper,
  ) {
    this.logger = this._loggerFactory.createLogger(SeedAdminService.name);
  }

  async seedAdmin(): Promise<IAdmin> {
    try {
      const email = this._config.get<string>('ADMIN_EMAIL');
      const password = this._config.get<string>('ADMIN_PASSWORD');

      if (!email || !password) {
        throw new Error('Failed to fetch admin credentials from env.');
      }

      const hashedPassword = await this._argon.hash(password);

      const newAdmin = await this._adminRepository.createAdmin(email, hashedPassword);

      if (!newAdmin) {
        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
      }

      return this._adminMapper.toEntity(newAdmin);
    } catch (err) {
      this.logger.error('Error caught while saving the admin: ', err);
      throw new InternalServerErrorException('Something happened when saving admin');
    }
  }
}
