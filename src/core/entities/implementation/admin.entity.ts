import { IAdmin } from "../interfaces/admin.interface";
import { BaseEntity } from "../base/implementation/base.entity";

export class Admin extends BaseEntity implements IAdmin {
    email: string;
    password: string;
    type: "admin";

    constructor(partial: Partial<Admin>) {
        super(partial);
        Object.assign(this, partial);
    }
}