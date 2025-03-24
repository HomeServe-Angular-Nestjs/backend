import { Injectable } from "@nestjs/common";
import { MailerOtpService } from "../nodeMailer/mailer.service";
import { IOtpService } from "./otp.interface";

@Injectable({})
export class OtpService implements IOtpService {
    constructor(private readonly mailer: MailerOtpService) { }

    private generateOtp(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    async sendOtp(email: string): Promise<void> {
        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

        try {
            this.mailer.sendOtpEmail(email, otp);
        } catch (err) {
            console.log('Error caught  in the otpService', err);
        }
    }
}