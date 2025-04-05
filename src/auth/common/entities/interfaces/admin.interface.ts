import { IEntity } from "./base/base-entity.entity.interface";

export interface IAdmin extends IEntity {
    email: string;
    password: string;
}