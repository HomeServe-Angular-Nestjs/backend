import { Injectable, InternalServerErrorException } from "@nestjs/common";
// import { MailerService } from "@nestjs-modules/mailer";
import { IMailerOtpService } from "./mailer.interface";
import { createTransport, SendMailOptions, Transporter } from 'nodemailer'

@Injectable({})
export class MailerOtpService implements IMailerOtpService {

    private mailTransporter: Transporter;

    constructor() {
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
                rejectUnauthorized: process.env.NODE_ENV === 'production',
                minVersion: 'TLSv1.2',
            },
            // logger: true,
        });
    }

    async sendOtpEmail(to: string, otp: number): Promise<void> {
        const mailOptions: SendMailOptions = {
            from: {
                name: 'HomeServe',
                address: process.env.SMTP_FROM as string
            },
            to,
            subject: 'Registration OTP',
            html: `<p>You may verify your account using the otp below: 
         <span style="font-size:24px; font-weight: 700;">${otp}</span></p>
         <br><p>Regards, <br> HomeServe</p>`,
        }

        await this.mailTransporter.sendMail(mailOptions)


        // try {
        //     await this.mailerService.sendMail({
        //         to,
        //         subject: 'Your OTP Code',
        //         // template: 'otp',
        //         // context: {
        //         //     otp,
        //         //     expiry: '1 minute',
        //         // },
        //         text: `${otp}This is a test email without templates`,
        //     });

        // } catch (e) {
        //     console.error('Full mail error:', {
        //         message: e.message,
        //         stack: e.stack,
        //         response: e.response,
        //         code: e.code,
        //         fullError: JSON.stringify(e, null, 2)
        //     });
        //     throw new InternalServerErrorException('Failed to send email');
        // }

    }
}