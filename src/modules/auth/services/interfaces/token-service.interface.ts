import { IPayload } from '../../../../core/misc/payload.interface';

export interface ITokenService {
  validateAccessToken(token: string): Promise<IPayload>;
  validateRefreshToken(userId: string, refreshToken: string): Promise<IPayload | null>;
  invalidateTokens(userId: string, token: string): Promise<void>;
  decode(token: string): IPayload | null;
  generateAccessToken(userId: string, email: string, type: string): string;
  generateRefreshToken(userId: string, email: string, type: string): Promise<string>;
  verifyToken(token: string): Promise<IPayload>;
}
