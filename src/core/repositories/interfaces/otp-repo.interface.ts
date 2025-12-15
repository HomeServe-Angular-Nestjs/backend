import { IOtp } from "@core/entities/interfaces/otp.entity.interface";

export interface IOtpRepository {
  removePreviousOtp(email: string): Promise<void>;
  findOtp(email: string): Promise<IOtp | null>;
  create(data: { email: string; code: string }): Promise<IOtp | null>;
}
