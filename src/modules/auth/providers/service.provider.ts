import {
    LOGIN_SERVICE_INTERFACE_NAME, OTP_SERVICE_INTERFACE_NAME, SIGNUP_SERVICE_INTERFACE_NAME,
    TOKEN_SERVICE_NAME
} from '@core/constants/service.constant';
import { LoginService } from '@modules/auth/services/implementations/login.service';
import { OtpService } from '@modules/auth/services/implementations/otp.service';
import { SignupService } from '@modules/auth/services/implementations/signup.service';
import { TokenService } from '@modules/auth/services/implementations/token.service';
import { Provider } from '@nestjs/common';

export const serviceProvider: Provider[] = [
  {
    provide: OTP_SERVICE_INTERFACE_NAME,
    useClass: OtpService,
  },
  {
    provide: SIGNUP_SERVICE_INTERFACE_NAME,
    useClass: SignupService,
  },
  {
    provide: LOGIN_SERVICE_INTERFACE_NAME,
    useClass: LoginService,
  },
  {
    provide: TOKEN_SERVICE_NAME,
    useClass: TokenService,
  },
];
