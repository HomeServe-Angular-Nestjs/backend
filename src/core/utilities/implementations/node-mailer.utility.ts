import { createTransport, SendMailOptions, Transporter } from 'nodemailer';

import { Inject, Injectable } from '@nestjs/common';

import { ICustomLogger } from '@core/logger/interface/custom-logger.interface';
import { ILoggerFactory, LOGGER_FACTORY } from '@core/logger/interface/logger-factory.interface';

import { IMailService } from '@core/services/mail/mail.service.interface';

import { buildEmailHtml, buildEmailSubject } from '../../services/mail/email-template';

@Injectable()
export class NodeMailerUtility implements IMailService {
  private readonly logger: ICustomLogger;
  private mailTransporter!: Transporter;

  constructor(
    @Inject(LOGGER_FACTORY)
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger(NodeMailerUtility.name);
    this.initializeMailTransPorter();
  }

  private initializeMailTransPorter() {
    this.mailTransporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true',
        minVersion: 'TLSv1.2',
      },
      logger: true,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });
  }

  async sendEmail(to: string, item: string, type: string): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: {
        name: 'HomeServe',
        address: process.env.SMTP_FROM as string,
      },
      to,
      subject: buildEmailSubject(type),
      html: buildEmailHtml(type, item),
    };

    try {
      await this.mailTransporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to} (type: ${type})`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} (type: ${type})`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }
}
