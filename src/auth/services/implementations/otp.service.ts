import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IOtpService } from "../interfaces/otp-service.interface";
import { IOtpRepository } from "src/auth/repositories/interfaces/otp-repo.interface";
import { IMailerOtpUtility } from "../../common/utilities/interface/mailer.utility.interface";
import { OTP_REPOSITORY_INTERFACE_NAME } from "src/auth/constants/repository.constant";
import { MAILER_OTP_UTILITY_INTERFACE_NAME } from "src/auth/constants/utility.constant";

@Injectable()
export class OtpService implements IOtpService {

    constructor(
        @Inject(OTP_REPOSITORY_INTERFACE_NAME)
        private readonly otpRepository: IOtpRepository,

        @Inject(MAILER_OTP_UTILITY_INTERFACE_NAME)
        private readonly mailerService: IMailerOtpUtility,
    ) { }

    async generateAndSendOtp(email: string) {
        await this.otpRepository.removePreviousOtp(email);

        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        // saves OTP
        await this.otpRepository.create({
            email,
            code,
            expiresAt
        });

        await this.mailerService.sendOtpEmail(email, code)
    }

    async verifyOtp(email: string, code: string): Promise<boolean> {
        const otp = await this.otpRepository.findValidOtp(email, code);
   
        if (!otp || otp.code !== code || new Date() > otp.expiresAt) {
            throw new BadRequestException('Invalid Otp');
        }

        return true;
    }

    private generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}