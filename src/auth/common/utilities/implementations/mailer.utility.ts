import { Injectable } from "@nestjs/common";
import { createTransport, SendMailOptions, Transporter } from 'nodemailer'
import { IMailerOtpUtility } from "../interface/mailer.utility.interface";

@Injectable({})
export class MailerOtpUtility implements IMailerOtpUtility {

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

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const mailOptions: SendMailOptions = {
            from: {
                name: 'HomeServe',
                address: process.env.SMTP_FROM as string
            },
            to,
            subject: 'Registration OTP',
            html: `
            <p>You may verify your account using the otp below: 
                <span style="font-size:24px; font-weight: 700;">${otp}</span>
            </p>  <br>    
            <p>Regards, <br> HomeServe</p>
            `,
        }

        this.mailTransporter.sendMail(mailOptions);
    }
}