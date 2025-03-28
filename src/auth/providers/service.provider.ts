import { Provider } from "@nestjs/common";
import { LOGIN_SERVICE_INTERFACE_NAME, OTP_SERVICE_INTERFACE_NAME, SIGNUP_SERVICE_INTERFACE_NAME } from "../constants/service.constant";
import { OtpService } from "../services/implementations/otp.service";
import { SignupService } from "../services/implementations/signup.service";
import { LoginService } from "../services/implementations/login.service";

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
    }
]
