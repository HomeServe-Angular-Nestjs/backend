import { IPayload } from '../../misc/payload.interface';

export interface ITokenService {
  generateToken(userId: string, email: string): Promise<string>;
  validateAccessToken(token: string): Promise<IPayload>;
  validateRefreshToken(userId: string): Promise<IPayload | null>;
  invalidateTokens(userId: string): Promise<void>;
  decode(token: string): IPayload | null;
}
