import {
  CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';
import { OTP_SERVICE_INTERFACE_NAME } from '@core/constants/service.constant';
import { ARGON_UTILITY_NAME } from '@core/constants/utility.constant';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { IProviderRepository } from '@core/repositories/interfaces/provider-repo.interface';
import { IArgonUtility } from '@core/utilities/interface/argon.utility.interface';
import { CompleteSignupDto, InitiateSignupDto } from '@modules/auth/dtos/signup.dto';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { ISignupService } from '@modules/auth/services/interfaces/signup-service.interface';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SignupService implements ISignupService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_INTERFACE_NAME)
    private readonly customerRepository: ICustomerRepository,
    @Inject(PROVIDER_REPOSITORY_INTERFACE_NAME)
    private readonly providerRepository: IProviderRepository,
    @Inject(OTP_SERVICE_INTERFACE_NAME)
    private readonly otpService: IOtpService,
    @Inject(ARGON_UTILITY_NAME)
    private readonly argon: IArgonUtility,
  ) { }

  // Initiates signup
  async initiateSignup(dto: InitiateSignupDto): Promise<void> {
    if (await this.checkEmailExistence(dto)) {
      throw new ConflictException('Email already exists');
    }

    await this.otpService.generateAndSendOtp(dto.email);
  }

  async completeSignup(dto: CompleteSignupDto): Promise<void> {
    const hashedPassword = await this.argon.hash(dto.password);

    if (dto.type === 'customer') {
      await this.customerRepository.create({
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        isActive: true,
      });
    } else if (dto.type === 'provider') {
      await this.providerRepository.create({
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        isActive: true,
      });
    }
  }

  private async checkEmailExistence(dto: InitiateSignupDto): Promise<boolean> {
    const repository =
      dto.type === 'customer'
        ? this.customerRepository
        : this.providerRepository;
    const existingEntry = await repository.findByEmail(dto.email);
    return existingEntry ? true : false;
  }
}
