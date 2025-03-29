import { Injectable } from "@nestjs/common";
import { createTransport, SendMailOptions, Transporter } from 'nodemailer'
import { IMailerUtility } from "../interface/mailer.utility.interface";

@Injectable({})
export class MailerUtility implements IMailerUtility {

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
            logger: false
        });
    }

    async sendEmail(to: string, item: string, type: string): Promise<void> {
        const mailOptions: SendMailOptions = {
            from: {
                name: 'HomeServe',
                address: process.env.SMTP_FROM as string
            },
            to,
            subject: type === 'otp' ? 'Registration OTP' : type === 'link' ? "Verification Link" : `${type}`,
            html: `
            <p>You may verify your account using the ${type} below: 
                <span style="${type === 'link' ? 'font-size: 16px; font-weight: 700;' : 'font-size:24px; font-weight: 700;'}">
                ${type === 'link' ? process.env.VERIFICATION_LINK + '?verification_token=' + item : item}
                </span>
            </p>  <br>    
            <p>Regards, <br> HomeServe</p>
            `,
        }

        this.mailTransporter.sendMail(mailOptions);
    }
}