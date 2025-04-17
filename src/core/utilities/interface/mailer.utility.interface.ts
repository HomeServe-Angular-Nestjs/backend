export interface IMailerUtility {
  sendEmail(to: string, item: string, type: string): Promise<void>;
}
