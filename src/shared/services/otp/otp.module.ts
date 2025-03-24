import { Module } from "@nestjs/common";
import { MailerServiceModule } from "../nodeMailer/mailer.module";
import { OtpService } from "./otp.service";

@Module({
    imports: [MailerServiceModule],
    providers: [OtpService],
    exports: [OtpService]
})
export class OtpModule { }