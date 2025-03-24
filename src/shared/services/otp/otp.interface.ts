export interface IOtpService {
    sendOtp(email: string): Promise<void>;
}