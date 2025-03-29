import { Module } from "@nestjs/common";
import { ArgonUtility } from "./utilities/implementations/argon.utility";
import { MailerUtility } from "./utilities/implementations/mailer.utility";

@Module({
    providers: [ArgonUtility, MailerUtility],
    exports: [ArgonUtility, MailerUtility]
})
export class CommonModule { }
