import { IPayload } from '../../../modules/auth/misc/payload.interface';

export interface ITokenUtility {
  generateAccessToken(payload: IPayload): string;
  verifyToken(token: string): Promise<IPayload>;
}
