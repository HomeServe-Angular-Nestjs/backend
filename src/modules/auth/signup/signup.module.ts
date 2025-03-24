import { Module } from "@nestjs/common";
import { SignupController } from "./controller/signup.controller";
import { SignupService } from "./services/implementations/signup.service";
import { MailerServiceModule } from "src/shared/services/nodeMailer/mailer.module";
import { OtpModule } from "src/shared/services/otp/otp.module";

@Module({
    imports: [OtpModule],
    controllers: [SignupController],
    providers: [SignupService]
})
export class SignupModule { }