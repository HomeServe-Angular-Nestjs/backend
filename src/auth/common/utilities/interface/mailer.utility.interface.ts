export interface IMailerOtpUtility {
    sendOtpEmail(to: string, otp: string): Promise<void>;
}