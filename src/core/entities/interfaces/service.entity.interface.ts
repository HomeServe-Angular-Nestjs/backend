import { IEntity } from "../base/interfaces/base-entity.entity.interface";

export interface ISubService {
    title: string;
    desc: string;
    price: number;
    estimatedTime: string;
    image: string;
    tag: string;
    isACtive: boolean;
    isDeleted: boolean;
}

export interface IService extends IEntity {
    title: string;
    desc: string;
    image: string;
    subservice: ISubService[] | [];
    isActive: boolean;
    isVerified: boolean;
    isDeleted: boolean;
    provider: string;
}