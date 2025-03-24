import { Injectable } from "@nestjs/common";
import { ISignupService } from "../interfaces/signupService.interface";
import { InitialSignupDto } from "../../dtos/signup.dto";
import { OtpService } from "src/shared/services/otp/otp.service";

@Injectable({})
export class SignupService implements ISignupService {
    constructor(private readonly otpService: OtpService) { }

    sendOtp(dto: InitialSignupDto): Promise<void> {
        return this.otpService.sendOtp(dto.email);
    }
}