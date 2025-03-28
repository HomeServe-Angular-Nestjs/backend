import { ICustomer } from "../interfaces/customer.entity.interface";
import { BaseUserEntity } from "./base/base-user.entity";

export class Customer extends BaseUserEntity implements ICustomer {
    locations?: { lat: number; lng: number; }[] | null;
    savedProviders?: string[] | null;

    constructor(partial: Partial<Customer>) {
        super(partial);
        Object.assign(this, partial);
    }
}