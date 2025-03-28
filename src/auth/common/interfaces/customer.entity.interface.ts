import { IBaseUserEntity } from "./base/base-user.entity.interface";

export interface ICustomer extends IBaseUserEntity {
    locations?: {
        lat: number,
        lng: number
    }[] | null;
    savedProviders?: string[] | null;
}