import { UserType } from '../../modules/auth/dtos/login.dto';

export interface IPayload {
  sub: string;
  email: string;
  type: UserType;
}
