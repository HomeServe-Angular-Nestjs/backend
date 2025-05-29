import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { IFast2SmsService } from '../interface/fast2sms.interface';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Fast2SmsService implements IFast2SmsService {
    private readonly logger = new Logger(Fast2SmsService.name);

    constructor(
        private readonly _httpService: HttpService,
        private _config: ConfigService
    ) { }

    async sendOtp(phone: number): Promise<any> {
        const FAST2SMS_API_KEY = this._config.get('FAST2SMS_API_KEY');

        const params = {
            authorization: FAST2SMS_API_KEY,
            message: `Your OTP is ${this.generateOtp()}.`,
            numbers: phone,
            route: 'v3',
            sender_id: 'FSTSMS',
            language: 'english'
        };

        const response$ = this._httpService.get('https://www.fast2sms.com/dev/bulkV2', { params });
        const response = await firstValueFrom(response$);
        this.logger.debug(response.data);
        return response.data;
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 999999).toString();
    }
}