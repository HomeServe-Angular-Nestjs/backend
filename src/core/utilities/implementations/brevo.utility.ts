import { BrevoClient } from '@getbrevo/brevo';

import { Inject, Injectable } from '@nestjs/common';

import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';

import { IMailService } from '@core/services/mail/mail.service.interface';

import { buildEmailHtml, buildEmailSubject } from '../../services/mail/email-template';

@Injectable()
export class BrevoUtility implements IMailService {
  private readonly logger: ICustomLogger;
  private readonly brevoClient: BrevoClient;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(BrevoUtility.name);
    this.brevoClient = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY || '',
      timeoutInSeconds: 30,
    });
  }

  async sendEmail(to: string, item: string, type: string): Promise<void> {
    try {
      await this.brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.MAIL_FROM_NAME || 'HomeServe',
          email: process.env.MAIL_FROM_EMAIL as string,
        },
        to: [{ email: to }],
        subject: buildEmailSubject(type),
        htmlContent: buildEmailHtml(type, item),
      });

      this.logger.log(`Email sent successfully to ${to} (type: ${type}) via Brevo`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} (type: ${type}) via Brevo`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
