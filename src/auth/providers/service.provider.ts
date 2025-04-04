import { Provider } from "@nestjs/common";
import { CONFIG_SERVICE_NAME, LOGIN_SERVICE_INTERFACE_NAME, OTP_SERVICE_INTERFACE_NAME, SIGNUP_SERVICE_INTERFACE_NAME, TOKEN_SERVICE_NAME } from "../constants/service.constant";
import { OtpService } from "../services/implementations/otp.service";
import { SignupService } from "../services/implementations/signup.service";
import { LoginService } from "../services/implementations/login.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "../services/implementations/token.service";

export const serviceProvider: Provider[] = [
    {
        provide: OTP_SERVICE_INTERFACE_NAME,
        useClass: OtpService
    },
    {
        provide: SIGNUP_SERVICE_INTERFACE_NAME,
        useClass: SignupService
    },
    {
        provide: LOGIN_SERVICE_INTERFACE_NAME,
        useClass: LoginService
    },
    {
        provide: CONFIG_SERVICE_NAME,
        useClass: ConfigService
    },
    {
        provide: TOKEN_SERVICE_NAME,
        useClass: TokenService
    }
]
