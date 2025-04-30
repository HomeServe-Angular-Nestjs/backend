import { IPayload } from "../../../../core/misc/payload.interface";

export interface ITokenService {
  validateAccessToken(token: string): Promise<IPayload>;
  validateRefreshToken(userId: string): Promise<IPayload | null>;
  invalidateTokens(userId: string): Promise<void>;
  decode(token: string): IPayload | null;
  generateAccessToken(userId: string, email: string): string;
  generateRefreshToken(userId: string, email: string): Promise<string>;
}
