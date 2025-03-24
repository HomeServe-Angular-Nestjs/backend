import { Module } from "@nestjs/common";
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'node:path';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerOtpService } from "./mailer.service";

    @Module({
        imports: [
            // MailerModule.forRootAsync({
            //     imports: [ConfigModule],
            //     useFactory: (configService: ConfigService) => ({
            //         transport: {
            //             host: 'smtp.gmail.com',
            //             port: 465, // SSL port (not 587)
            //             secure: true,
            //         },
            //         tls: {
            //             // These are the magic lines
            //             servername: 'smtp.gmail.com',
            //             minVersion: 'TLSv1.2',
            //             ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA',
            //         },
            //         defaults: {
            //             from: `"No Reply" sajid189210@gmail.com`// <${configService.get('SMTP_FROM')}>`,
            //         },
            //         // template: {
            //         //     dir: join(process.cwd(), 'assets/templates'),
            //         //     adapter: new HandlebarsAdapter(),
            //         //     options: {
            //         //         strict: true
            //         //     }
            //         // },
            //     }),
            //     inject: [ConfigService],
            // }),
        ],
        providers: [MailerOtpService],
        exports: [MailerOtpService]
    })
    export class MailerServiceModule { }