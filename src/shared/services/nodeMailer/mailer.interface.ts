export interface IMailerOtpService {
    sendOtpEmail(to: string, otp: number): Promise<void>;
}