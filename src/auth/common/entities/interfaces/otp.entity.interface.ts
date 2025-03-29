import { IEntity } from "./base/base-entity.entity.interface";

export interface IOtp extends IEntity {
    email: string;
    code: string;
    expiresAt: Date;
}