export interface IMailService {
  sendEmail(to: string, item: string, type: string): Promise<void>;
}
