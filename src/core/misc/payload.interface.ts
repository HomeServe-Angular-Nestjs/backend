import { UserType } from "@core/entities/interfaces/user.entity.interface";

export interface IPayload {
  sub: string;
  email: string;
  type: UserType;
}
