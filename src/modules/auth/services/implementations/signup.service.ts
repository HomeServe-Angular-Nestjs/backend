import {
  CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import { OTP_SERVICE_INTERFACE_NAME } from '@core/constants/service.constant';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { CompleteSignupDto, InitiateSignupDto } from '@modules/auth/dtos/signup.dto';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { ISignupService } from '@modules/auth/services/interfaces/signup-service.interface';
import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class SignupService implements ISignupService {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
    private readonly _customerRepository: ICustomerRepository,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private readonly _providerRepository: IProviderRepository,
    @Inject(OTP_SERVICE_INTERFACE_NAME)
    private readonly _otpService: IOtpService,
    @Inject(ARGON_UTILITY_NAME)
    private readonly _argon: IArgonUtility,
  ) {
    this.logger = this._loggerFactory.createLogger(SignupService.name);
  }

  // Initiates signup
  async initiateSignup(dto: InitiateSignupDto): Promise<void> {
    if (await this.checkEmailExistence(dto)) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: ErrorMessage.EMAIL_CONFLICT_ERROR
      });
    }

    await this._otpService.generateAndSendOtp(dto.email);
  }

  async verifyOtpAndCreateUser(dto: CompleteSignupDto): Promise<void> {
    try {
      await this._otpService.verifyOtp(dto.email, dto.code);

      const hashedPassword = await this._argon.hash(dto.password);

      if (dto.type === 'customer') {
        await this._customerRepository.create({
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          isActive: true,
        });
      } else if (dto.type === 'provider') {
        await this._providerRepository.create({
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
          isActive: true,
        });
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error);
      }

      this.logger.error('Error while completing the signup.');
      throw new InternalServerErrorException(ErrorMessage.INTERNAL_SERVER_ERROR);
    }
  }

  private async checkEmailExistence(dto: InitiateSignupDto): Promise<boolean> {
    const repository =
      dto.type === 'customer'
        ? this._customerRepository
        : this._providerRepository;
    const existingEntry = await repository.findByEmail(dto.email);
    return existingEntry ? true : false;
  }
}
