import { OTP_MAPPER } from '@core/constants/mappers.constant';
import { OTP_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { MAILER_UTILITY_INTERFACE_NAME } from '@core/constants/utility.constant';
import { IOtpMapper } from '@core/dto-mapper/interface/otp.mapper';
import { ErrorCodes } from '@core/enum/error.enum';
import { IOtpRepository } from '@core/repositories/interfaces/otp-repo.interface';
import { IMailerUtility } from '@core/utilities/interface/mailer.utility.interface';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    @Inject(OTP_REPOSITORY_INTERFACE_NAME)
    private readonly otpRepository: IOtpRepository,
    @Inject(MAILER_UTILITY_INTERFACE_NAME)
    private readonly mailerService: IMailerUtility,
    @Inject(OTP_MAPPER)
    private readonly _otpMapper: IOtpMapper,
  ) { }

  private _generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  async generateAndSendOtp(email: string) {
    await this.otpRepository.removePreviousOtp(email);

    const code = this._generateOtp();

    const otpDoc = await this.otpRepository.create(this._otpMapper.toDocument({ email, code }));
    if (!otpDoc) throw new InternalServerErrorException({
      code: ErrorCodes.DATABASE_OPERATION_FAILED,
      message: 'Failed to save Otp.'
    });

    await this.mailerService.sendEmail(email, code, 'otp');
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOtp(email);

    if (!otp) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'Otp expired. Please try again.'
      });
    }

    if (otp.code !== code) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'Invalid Otp. Please try again.'
      });
    }

    return true;
  }
}
