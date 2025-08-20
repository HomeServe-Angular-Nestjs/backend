import { ADMIN_MAPPER, CUSTOMER_MAPPER, PROVIDER_MAPPER } from '@core/constants/mappers.constant';
import {
  ADMIN_REPOSITORY_INTERFACE_NAME, CUSTOMER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_REPOSITORY_INTERFACE_NAME,
  WALLET_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { TOKEN_SERVICE_NAME } from '@core/constants/service.constant';
import {
  ARGON_UTILITY_NAME, MAILER_UTILITY_INTERFACE_NAME
} from '@core/constants/utility.constant';
import { IAdminMapper } from '@core/dto-mapper/interface/admin.mapper.interface';
import { ICustomerMapper } from '@core/dto-mapper/interface/customer.mapper';
import { IProviderMapper } from '@core/dto-mapper/interface/provider.mapper';
import { IAdmin } from '@core/entities/interfaces/admin.entity.interface';
import { ICustomer, IProvider, IUser } from '@core/entities/interfaces/user.entity.interface';
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
import { IMailerUtility } from '@core/utilities/interface/mailer.utility.interface';
import {
  AuthLoginDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, UserType, VerifyTokenDto
} from '@modules/auth/dtos/login.dto';
import { ILoginService } from '@modules/auth/services/interfaces/login-service.interface';
import { ITokenService } from '@modules/auth/services/interfaces/token-service.interface';
import {
  BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Types } from 'mongoose';

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
    @Inject(ADMIN_REPOSITORY_INTERFACE_NAME)
    private _adminRepository: IAdminRepository,
    @Inject(ARGON_UTILITY_NAME)
    private _argon: IArgonUtility,
    @Inject(MAILER_UTILITY_INTERFACE_NAME)
    private _mailerService: IMailerUtility,
    @Inject(TOKEN_SERVICE_NAME)
    private _tokenService: ITokenService,
    @Inject(ADMIN_MAPPER)
    private readonly _adminMapper: IAdminMapper,
    @Inject(PROVIDER_MAPPER)
    private readonly _providerMapper: IProviderMapper,
    @Inject(CUSTOMER_MAPPER)
    private readonly _customerMapper: ICustomerMapper,
    @Inject(WALLET_REPOSITORY_NAME)
    private readonly _walletRepository: IWalletRepository
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

  private async _createWallet(userId: string) {
    const wallet = await this._walletRepository.findWallet(userId);
    if (wallet) return;
    await this._walletRepository.create({
      userId: new Types.ObjectId(userId),
    });
  }

  async validateUserCredentials(dto: AuthLoginDto): Promise<IUser> {
    const repository = this._findRepo(dto.type);
    const userDocument = await repository.findByEmail(dto.email);

    if (!userDocument || !userDocument.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = this._mappedUser(dto.type, userDocument);

    const isValidPassword = await this._argon.verify(
      user.password,
      dto.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    
    if (dto.type === 'customer' || dto.type === 'provider') {
      if (!user.isActive) {
        throw new UnauthorizedException('You are blocked by the admin.');
      }
      await Promise.all([
        repository.findOneAndUpdate(
          { email: dto.email },
          { $set: { lastLogin: new Date() } },
        ),
        this._createWallet(user.id)
      ]);
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
      if (existingUser.googleId) {
        return this._mappedUser(user.type, existingUser);
      }

      const updatedUser = await repository.findOneAndUpdate(
        { email: existingUser.email },
        { $set: { googleId: user.googleId, lastLogin: new Date() } },
        { new: true },
      );

      if (!updatedUser) {
        throw new InternalServerErrorException(
          'Failed to update user with Google ID',
        );
      }

      return this._mappedUser(user.type, updatedUser);
    }

    let newUserDocument: CustomerDocument | ProviderDocument;

    if (user.type === 'customer') {
      newUserDocument = await this._customerRepository.create({
        email: user.email,
        username: user.name,
        googleId: user.googleId,
        avatar: user.avatar,
        isActive: true,
        lastLogin: new Date(),
      });
    } else if (user.type === 'provider') {
      newUserDocument = await this._providerRepository.create({
        email: user.email,
        username: user.name,
        googleId: user.googleId,
        avatar: user.avatar,
        lastLogin: new Date(),
        isActive: true,
      });
    } else {
      throw new BadRequestException('Invalid user type');
    }

    const newUser = this._mappedUser(user.type, newUserDocument);
    await this._createWallet(newUser.id);
    return newUser;
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const repository =
      dto.type === 'customer'
        ? this._customerRepository
        : this._providerRepository;

    const userDocument = await repository.findByEmail(dto.email);
    if (!userDocument) throw new NotFoundException('User not found');
    const user = this._mappedUser(dto.type, userDocument);

    const token = this._tokenService.generateAccessToken(user.id, user.email, dto.type);

    await this._mailerService.sendEmail(dto.email, token, 'link');
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    try {
      const repository = this._findRepo(dto.type);
      const hashedPassword = await this._argon.hash(dto.password);

      const updatedUser = await repository.findOneAndUpdate(
        { email: dto.email },
        { $set: { password: hashedPassword } },
      );

      if (!updatedUser) throw new NotFoundException('Not found Exception');
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to update password');
    }
  }

}


