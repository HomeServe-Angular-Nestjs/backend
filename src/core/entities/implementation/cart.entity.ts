import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { ICart } from "@core/entities/interfaces/cart.entity.interface";

export class Cart extends BaseEntity implements ICart {
    customerId: string;
    items: string[];

    constructor(partial: Partial<Cart>) {
        super(partial);
        Object.assign(this, partial);
    }
}
