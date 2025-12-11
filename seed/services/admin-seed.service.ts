import { Inject, Injectable, InternalServerErrorException, } from '@nestjs/common';
import { ISeedAdminService } from '../interface/seed-service.interface';
import { ADMIN_REPOSITORY_NAME, ADMIN_SETTINGS_REPOSITORY_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { IAdminRepository } from '@core/repositories/interfaces/admin-repo.interface';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { ADMIN_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import { ErrorMessage } from '@core/enum/error.enum';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { IAdmin } from '@core/entities/interfaces/admin.entity.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { IWalletMapper } from '@core/dto-mapper/interface/wallet.mapper.interface';
import { AdminDocument } from '@core/schema/admin.schema';
import { IAdminSettingsRepository } from '@core/repositories/interfaces/admin-settings-repo.interface';

@Injectable()
export class SeedAdminService implements ISeedAdminService {
  private logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(ADMIN_REPOSITORY_NAME)
    private readonly _adminRepository: IAdminRepository,
    @Inject(ARGON_UTILITY_NAME)
    private readonly _argon: IArgonUtility,
    @Inject(ADMIN_MAPPER)
    private readonly _adminMapper: IAdminMapper,
    @Inject(WALLET_REPOSITORY_NAME)
    private readonly _walletRepository: IWalletRepository,
    @Inject(WALLET_MAPPER)
    private readonly _walletMapper: IWalletMapper,
    @Inject(ADMIN_SETTINGS_REPOSITORY_NAME)
    private readonly _adminSettingsRepository: IAdminSettingsRepository,
  ) {
    this.logger = this._loggerFactory.createLogger(SeedAdminService.name);
  }

  async seedAdmin(email: string, password: string): Promise<IAdmin> {
    try {
      if (!email || !password) {
        throw new Error('Admin credentials are required.Missing email or password.');
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/]).{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new Error(
          'Password must contain at least 8 characters, one uppercase letter, one number, and one special character.'
        );
      }

      const hashedPassword = await this._argon.hash(password);

      const existingAdmin = await this._adminRepository.findOne({ email });

      let savedAdmin: AdminDocument | null;

      if (existingAdmin) {
        let admin = await this._adminRepository.findOneAndUpdate(
          { email },
          { password: hashedPassword }
        );

        savedAdmin = admin;

        this.logger.log('Admin updated successfully');
      } else {
        const newAdmin = await this._adminRepository.createAdmin(email, hashedPassword);

        if (!newAdmin) {
          this.logger.error('Failed to create admin');
          throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
        }

        savedAdmin = newAdmin;
      }

      if (!savedAdmin) {
        this.logger.error('Failed to save admin');
        throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
      }

      const admin = this._adminMapper.toEntity(savedAdmin);
      const wallet = await this._walletRepository.findOne({ type: 'admin' });
      if (!wallet) {
        await this._walletRepository.create(this._walletMapper.toDocument({ userId: admin.id, type: 'admin' }));
      }

      const adminSettings = await this._adminSettingsRepository.find({});
      if (!adminSettings || !adminSettings.length) {
        await this._adminSettingsRepository.create({});
      }

      return admin;
    } catch (err) {
      this.logger.error('Error caught while saving the admin: ', err);
      throw new InternalServerErrorException('Something happened when saving admin');
    }
  }
}
