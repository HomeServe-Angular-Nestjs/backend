import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { IOtpService } from "../interfaces/otp-service.interface";
import { IOtpRepository } from "../../../../core/repositories/interfaces/otp-repo.interface";
import { IMailerUtility } from "../../../../core/utilities/interface/mailer.utility.interface";
import { OTP_REPOSITORY_INTERFACE_NAME } from "../../../../core/constants/repository.constant";
import { MAILER_UTILITY_INTERFACE_NAME } from "../../../../core/constants/utility.constant";

@Injectable()
export class OtpService implements IOtpService {

    constructor(
        @Inject(OTP_REPOSITORY_INTERFACE_NAME)
        private readonly otpRepository: IOtpRepository,

        @Inject(MAILER_UTILITY_INTERFACE_NAME)
        private readonly mailerService: IMailerUtility,
    ) { }

    async generateAndSendOtp(email: string) {
        await this.otpRepository.removePreviousOtp(email);

        const code = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // saves OTP
        await this.otpRepository.create({
            email,
            code,
            expiresAt
        });

        await this.mailerService.sendEmail(email, code, 'otp')
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