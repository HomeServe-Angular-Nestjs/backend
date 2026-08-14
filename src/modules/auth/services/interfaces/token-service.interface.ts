import type { IPayload } from '../../../../core/misc/payload.interface';

export interface IRefreshResult {
  refreshToken: string;
  payload: IPayload;
}

export interface ITokenService {
  validateAccessToken(token: string): Promise<IPayload>;
  validateRefreshToken(refreshToken: string): Promise<IPayload | null>;
  invalidateRefreshToken(refreshToken: string): Promise<void>;
  invalidateAccessToken(token: string): Promise<void>;
  decode(token: string): IPayload | null;
  generateAccessToken(userId: string, email: string, type: string): string;
  createSession(userId: string, email: string, type: string): Promise<IRefreshResult>;
  rotateRefreshToken(refreshToken: string): Promise<IRefreshResult>;
  verifyToken(token: string): Promise<IPayload>;
}
