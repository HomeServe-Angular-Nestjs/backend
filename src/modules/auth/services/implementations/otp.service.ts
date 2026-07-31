import { OTP_REPOSITORY_INTERFACE_NAME } from '@core/constants/repository.constant';
import { MAILER_UTILITY_INTERFACE_NAME } from '@core/constants/utility.constant';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IOtpRepository } from '@core/repositories/interfaces/otp-repo.interface';
import { IMailerUtility } from '@core/utilities/interface/mailer.utility.interface';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class OtpService implements IOtpService {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(OTP_REPOSITORY_INTERFACE_NAME)
    private readonly otpRepository: IOtpRepository,
    @Inject(MAILER_UTILITY_INTERFACE_NAME)
    private readonly mailerService: IMailerUtility,
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(OtpService.name);
  }

  private generateOtp(): string {
    return (Math.floor(1000 + Math.random() * 9000)).toString();
  }

  async generateAndSendOtp(email: string): Promise<void> {
    await this.otpRepository.removePreviousOtp(email);

    const code = this.generateOtp();

    const otpDoc = await this.otpRepository.create({ email, code });

    if (!otpDoc) {
      throw new InternalServerErrorException({
        code: ErrorCodes.DATABASE_OPERATION_FAILED,
        message: 'Failed to save OTP.',
      });
    }

    try {
      await this.mailerService.sendEmail(email, code, 'otp');
    } catch (error) {
      this.logger.error(
        `Failed to send OTP email to ${email}.`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    const otp = await this.otpRepository.findOtp(email);

    if (!otp) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_FAILED,
        message: ErrorMessage.OTP_EXPIRED,
      });
    }

    if (otp.code !== code) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_FAILED,
        message: ErrorMessage.INVALID_OTP,
      });
    }

    return true;
  }
}
