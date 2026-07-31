import { MAIL_SERVICE } from '@core/constants/service.constant';
import {
  BREVO_UTILITY_NAME,
  NODE_MAILER_UTILITY_NAME,
} from '@core/constants/utility.constant';
import { Module } from '@nestjs/common';
import { BrevoUtility } from '@core/utilities/implementations/brevo.utility';
import { NodeMailerUtility } from '@core/utilities/implementations/node-mailer.utility';
import { MailService } from './mail.service';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [
    {
      provide: MAIL_SERVICE,
      useClass: MailService,
    },
    {
      provide: NODE_MAILER_UTILITY_NAME,
      useClass: NodeMailerUtility,
    },
    {
      provide: BREVO_UTILITY_NAME,
      useClass: BrevoUtility,
    },
  ],
  exports: [MAIL_SERVICE, NODE_MAILER_UTILITY_NAME, BREVO_UTILITY_NAME],
})
export class MailModule { }
