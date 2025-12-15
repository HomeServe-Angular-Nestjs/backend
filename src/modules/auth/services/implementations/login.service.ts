import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ADMIN_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER, WALLET_MAPPER } from '@core/constants/mappers.constant';
import { ADMIN_REPOSITORY_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME, WALLET_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { OTP_SERVICE_INTERFACE_NAME } from '@core/constants/service.constant';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper..interface';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper.interface';
import { IWalletMapper } from '@core/dto-mapper/interface/wallet.mapper.interface';
import { IAdmin } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomer, IProvider, IUser, UserType } from '@core/entities/interfaces/user.entity.interface';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { UserReposType } from '@core/misc/repo.type';
import { IAdminRepository } from '@core/repositories/interfaces/admin-repo.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IWalletRepository } from '@core/repositories/interfaces/wallet-repo.interface';
import { AdminDocument } from '@core/schema/admin.schema';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { ILoginService } from '@modules/auth/services/interfaces/login-service.interface';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { IResponse } from '@core/misc/response.util';
import { AuthLoginDto, ChangePasswordDto, EmailAndTypeDto, GoogleLoginDto } from '@modules/auth/dtos/login.dto';

@Injectable()
export class LoginService implements ILoginService {
  private logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
    private _customerRepository: ICustomerRepository,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private _providerRepository: IProviderRepository,
    @Inject(ADMIN_REPOSITORY_NAME)
    private _adminRepository: IAdminRepository,
    @Inject(WALLET_REPOSITORY_NAME)
    private readonly _walletRepository: IWalletRepository,
    @Inject(OTP_SERVICE_INTERFACE_NAME)
    private readonly _otpService: IOtpService,
    @Inject(ARGON_UTILITY_NAME)
    private _argon: IArgonUtility,
    @Inject(ADMIN_MAPPER)
    private readonly _adminMapper: IAdminMapper,
    @Inject(PROVIDER_MAPPER)
    private readonly _providerMapper: IProviderMapper,
    @Inject(CUSTOMER_MAPPER)
    private readonly _customerMapper: ICustomerMapper,
    @Inject(WALLET_MAPPER)
    private readonly _walletMapper: IWalletMapper,
  ) {
    this.logger = this.loggerFactory.createLogger(LoginService.name);
  }

  private _findRepo(type: UserType): UserReposType {
    if (type === 'customer') {
      return this._customerRepository;
    } else if (type === 'provider') {
      return this._providerRepository;
    } else if (type === 'admin') {
      return this._adminRepository;
    } else {
      throw new BadRequestException('Invalid type Error.');
    }
  }

  private _mappedUser(
    type: UserType,
    user: CustomerDocument | ProviderDocument | AdminDocument)
    : ICustomer | IProvider | IAdmin {
    switch (type) {
      case 'customer':
        return this._customerMapper.toEntity(user as CustomerDocument);
      case 'provider':
        return this._providerMapper.toEntity(user as ProviderDocument);
      case 'admin':
        return this._adminMapper.toEntity(user as AdminDocument);
      default:
        throw new BadRequestException('Invalid type Error.');
    }
  }

  private async _createWallet(userId: string, type: UserType) {
    const wallet = await this._walletRepository.findWallet(userId);
    if (wallet) return;
    await this._walletRepository.create(this._walletMapper.toDocument({ userId, type }));
  }

  async validateUserCredentials(loginDto: AuthLoginDto): Promise<IUser> {
    const repository = this._findRepo(loginDto.type);
    const userDocument = await repository.findByEmail(loginDto.email);

    if (!userDocument || !userDocument.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = this._mappedUser(loginDto.type, userDocument);

    const isValidPassword = await this._argon.verify(
      user.password,
      loginDto.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED_ACCESS,
        message: ErrorMessage.LOGIN_FAILED
      });
    }

    if (loginDto.type === 'customer' || loginDto.type === 'provider') {
      if (!user.isActive) {
        throw new UnauthorizedException({
          code: ErrorCodes.UNAUTHORIZED_ACCESS,
          message: 'You are blocked by the admin.'
        });
      }

      loginDto.type === 'customer'
        ? await this._customerRepository.updateLastLogin(loginDto.email)
        : await this._providerRepository.updateLastLogin(loginDto.email);

      this._createWallet(user.id, loginDto.type as UserType)
    }

    return user;
  }

  async findOrCreateUser(user: GoogleLoginDto): Promise<IUser> {
    if (user.type === 'admin') {
      throw new BadRequestException(
        'Google login is not supported for admin users',
      );
    }

    const repository =
      user.type === 'customer'
        ? this._customerRepository
        : this._providerRepository;

    const existingUser = await repository.findByEmail(user.email);

    if (existingUser) {
      let responseUser = this._mappedUser(user.type, existingUser);

      if (existingUser.googleId) {
        await this._createWallet(responseUser.id, user.type);
        return responseUser;
      }

      const updatedUser = await repository.updateGoogleId(existingUser.email, user.googleId);

      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update user with Google ID');
      }

      responseUser = this._mappedUser(user.type, updatedUser);

      await this._createWallet(responseUser.id, user.type);
      return responseUser;
    }

    let newUserDocument: CustomerDocument | ProviderDocument;

    if (user.type === 'customer') {
      newUserDocument = await this._customerRepository.create(
        this._customerMapper.toDocument({
          email: user.email,
          username: user.name,
          googleId: user.googleId,
          avatar: user.avatar,
        }));
    } else if (user.type === 'provider') {
      newUserDocument = await this._providerRepository.create(
        this._providerMapper.toDocument({
          email: user.email,
          username: user.name,
          googleId: user.googleId,
          avatar: user.avatar,
        }));
    } else {
      throw new BadRequestException({
        code: ErrorCodes.BAD_REQUEST,
        message: 'Invalid user type'
      });
    }

    const newUser = this._mappedUser(user.type, newUserDocument);
    await this._createWallet(newUser.id, user.type);
    return newUser;
  }

  async requestOtpForForgotPassword(emailAndType: EmailAndTypeDto): Promise<IResponse> {
    const repository = emailAndType.type === 'customer'
      ? this._customerRepository
      : this._providerRepository;

    const userDocument = await repository.findByEmail(emailAndType.email);
    if (!userDocument) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: ErrorMessage.USER_NOT_FOUND
    });

    const user = this._mappedUser(emailAndType.type, userDocument);
    await this._otpService.generateAndSendOtp(user.email);
    return { success: true, message: 'Otp requested' }
  }

  async verifyOtpFromForgotPassword(email: string, code: string): Promise<IResponse> {
    await this._otpService.verifyOtp(email, code);
    return { success: true, message: 'Otp verified.' }
  }

  async changePassword(passwordDto: ChangePasswordDto): Promise<IResponse> {
    if (passwordDto.type === 'admin') throw new UnauthorizedException({
      code: ErrorCodes.UNAUTHORIZED_ACCESS,
      message: ErrorMessage.INVALID_TYPE
    });

    const hashedPassword = await this._argon.hash(passwordDto.password);
    let updatedUser: CustomerDocument | ProviderDocument | null = null;

    if (passwordDto.type === 'customer') {
      updatedUser = await this._customerRepository.updatePassword(passwordDto.email, hashedPassword);
    } else if (passwordDto.type === 'provider') {
      updatedUser = await this._providerRepository.updatePassword(passwordDto.email, hashedPassword);
    }

    if (!updatedUser) throw new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: 'Not found Exception'
    });

    return { success: true, message: 'Password updated successfully.' }
  }

}


