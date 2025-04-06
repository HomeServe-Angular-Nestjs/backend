import { IEntity } from "../base/interfaces/base-entity.entity.interface";

export interface IAdmin extends IEntity {
    email: string;
    password: string;
    type: 'admin'
}