import { IBaseRepository } from "../base/interfaces/base-repo.interface";
import { CartDocument, CartPopulatedDocument } from "@core/schema/cart.schema";

export interface ICartRepository extends IBaseRepository<CartDocument> {
    findAndPopulateByCustomerId(customerId: string): Promise<CartPopulatedDocument | null>;
    clearCartByCustomerId(customerId: string): Promise<boolean>;
    addItem(customerId: string, providerServiceId: string): Promise<boolean>;
    removeItem(customerId: string, providerServiceId: string): Promise<boolean>;
    isExists(customerId: string): Promise<boolean>;
    isItemExists(customerId: string, providerServiceId: string): Promise<boolean>;
    isTheSameProviderInCart(customerId: string, providerId: string): Promise<boolean>;
}
