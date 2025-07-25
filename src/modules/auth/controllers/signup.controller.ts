import {
    OTP_SERVICE_INTERFACE_NAME, SIGNUP_SERVICE_INTERFACE_NAME
} from '@core/constants/service.constant';
import { CUSTOM_LOGGER, ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { CompleteSignupDto, InitiateSignupDto, VerifyOtpDto } from '@modules/auth/dtos/signup.dto';
import { IOtpService } from '@modules/auth/services/interfaces/otp-service.interface';
import { ISignupService } from '@modules/auth/services/interfaces/signup-service.interface';
import { BadRequestException, Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';

@Controller('signup')
export class SignUpController {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly _loggerFactory: ILoggerFactory,
    @Inject(SIGNUP_SERVICE_INTERFACE_NAME)
    private readonly _signupService: ISignupService,
    @Inject(OTP_SERVICE_INTERFACE_NAME)
    private readonly _otpService: IOtpService,
  ) {
    this.logger = this._loggerFactory.createLogger(SignUpController.name);
  }

  @Post('initiate_signup')
  @HttpCode(200)
  async initiateSignup(@Body() dto: InitiateSignupDto) {
    await this._signupService.initiateSignup(dto);
    return { success: true, message: 'OTP send to email.' };
  }

  @Post('verify_otp')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this._otpService.verifyOtp(dto.email, dto.code);
    if (!isValid) throw new BadRequestException('Invalid Otp');
    return { success: true, message: 'OTP verified successfully' };
  }

  @Post('complete_signup')
  @HttpCode(201)
  async completeSignup(@Body() dto: CompleteSignupDto) {
    await this._signupService.completeSignup(dto);
    return { success: true, message: 'Customer created successfully' };
  }
}
