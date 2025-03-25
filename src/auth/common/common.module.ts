import { Module } from "@nestjs/common";
import { ArgonUtility } from "./utilities/implementations/argon.utility";
import { MailerOtpUtility } from "./utilities/implementations/mailer.utility";

@Module({
    providers: [ArgonUtility, MailerOtpUtility],
    exports: [ArgonUtility, MailerOtpUtility]
})
export class CommonModule { }
