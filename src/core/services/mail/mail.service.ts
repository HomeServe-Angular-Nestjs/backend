import { Inject, Injectable } from '@nestjs/common';

import { BREVO_UTILITY_NAME, NODE_MAILER_UTILITY_NAME } from '@core/constants/utility.constant';
import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';
import { IMailService } from '@core/services/mail/mail.service.interface';

@Injectable()
export class MailService implements IMailService {
  private readonly logger: ICustomLogger;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
    @Inject(NODE_MAILER_UTILITY_NAME)
    private readonly nodeMailerUtility: IMailService,
    @Inject(BREVO_UTILITY_NAME)
    private readonly brevoUtility: IMailService,
  ) {
    this.logger = this.loggerFactory.createLogger(MailService.name);
  }

  async sendEmail(to: string, item: string, type: string): Promise<void> {
    const provider = process.env.NODE_ENV === 'production' ? this.brevoUtility : this.nodeMailerUtility;

    this.logger.log(`Sending email to ${to} (type: ${type}) via ${provider.constructor.name}`);

    return provider.sendEmail(to, item, type);
  }
}
