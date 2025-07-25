import { JwtPayload } from 'jsonwebtoken';

import { UserType } from '../../modules/auth/dtos/login.dto';

export interface IPayload extends JwtPayload {
  sub: string;
  email: string;
  type?: UserType;
}
