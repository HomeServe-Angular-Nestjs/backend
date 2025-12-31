import { CART_MODEL_NAME } from "@core/constants/model.constant";
import { CART_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { CartRepository } from "@core/repositories/implementations/cart.repository";
import { CartDocument } from "@core/schema/cart.schema";
import { Provider } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Model } from "mongoose";

export const cartRepositoryProvider: Provider[] = [
    {
        provide: CART_REPOSITORY_NAME,
        useFactory: (cartModel: Model<CartDocument>) =>
            new CartRepository(cartModel),
        inject: [getModelToken(CART_MODEL_NAME)]
    }
];
