import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
} from '@nestjs/common';

import { ISignupService } from '../services/interfaces/signup-service.interface';
import { IOtpService } from '../services/interfaces/otp-service.interface';

import {
  OTP_SERVICE_INTERFACE_NAME,
  SIGNUP_SERVICE_INTERFACE_NAME,
} from '../../../core/constants/service.constant';

import {
  InitiateSignupDto,
  VerifyOtpDto,
  CompleteSignupDto,
} from '../dtos/signup.dto';

@Controller('signup')
export class SignUpController {
  constructor(
    @Inject(SIGNUP_SERVICE_INTERFACE_NAME)
    private readonly _signupService: ISignupService,
    @Inject(OTP_SERVICE_INTERFACE_NAME)
    private readonly _otpService: IOtpService,
  ) { }

  // STEP: 1
  @Post('initiate_signup')
  @HttpCode(200)
  async initiateSignup(@Body() dto: InitiateSignupDto) {
    await this._signupService.initiateSignup(dto);
    return { success: true, message: 'OTP send to email.' };
  }

  // STEP: 2
  @Post('verify_otp')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const isValid = await this._otpService.verifyOtp(dto.email, dto.code);
    if (!isValid) throw new BadRequestException('Invalid Otp');
    return { success: true, message: 'OTP verified successfully' };
  }

  // STEP: 3
  @Post('complete_signup')
  @HttpCode(201)
  async completeSignup(@Body() dto: CompleteSignupDto) {
    await this._signupService.completeSignup(dto);
    return { success: true, message: 'Customer created successfully' };
  }
}
