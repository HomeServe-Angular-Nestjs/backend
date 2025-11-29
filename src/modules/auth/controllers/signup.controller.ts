import { SIGNUP_SERVICE_INTERFACE_NAME } from '@core/constants/service.constant';
import { CompleteSignupDto, InitiateSignupDto } from '@modules/auth/dtos/signup.dto';
import { ISignupService } from '@modules/auth/services/interfaces/signup-service.interface';
import { Body, Controller, Inject, Post } from '@nestjs/common';

@Controller('signup')
export class SignUpController {

  constructor(
    @Inject(SIGNUP_SERVICE_INTERFACE_NAME)
    private readonly _signupService: ISignupService,
  ) { }

  @Post('initiate_signup')
  async initiateSignup(@Body() initiateSignupDto: InitiateSignupDto) {
    await this._signupService.initiateSignup(initiateSignupDto);
    return { success: true, message: 'OTP send to email.' };
  }

  @Post('verify_otp')
  async completeSignup(@Body() completeSignupDto: CompleteSignupDto) {
    return await this._signupService.verifyOtpAndCreateUser(completeSignupDto);
  }
}
