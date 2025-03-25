export interface IOtpService {
    generateAndSendOtp(email: string): Promise<void>;
    verifyOtp(email: string, code: string): Promise<boolean>;
}