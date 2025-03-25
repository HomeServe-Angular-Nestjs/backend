import { Provider } from "@nestjs/common";
import { OTP_SERVICE_INTERFACE_NAME, SIGNUP_SERVICE_INTERFACE_NAME } from "../constants/service.constant";
import { OtpService } from "../services/implementations/otp.service";
import { SignupService } from "../services/implementations/signup.service";

export const serviceProvider: Provider[] = [
    {
        provide: OTP_SERVICE_INTERFACE_NAME,
        useClass: OtpService
    },
    {
        provide: SIGNUP_SERVICE_INTERFACE_NAME,
        useClass: SignupService
    }
]
