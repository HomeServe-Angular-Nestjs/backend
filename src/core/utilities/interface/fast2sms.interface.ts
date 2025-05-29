export interface IFast2SmsService {
    sendOtp(phone: number): Promise<any>
}