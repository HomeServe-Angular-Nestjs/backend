import { CART_SERVICE_NAME } from "@core/constants/service.constant";
import { CART_MAPPER } from "@core/constants/mappers.constant";
import { CartService } from "../services/implementations/cart.service";
import { CartMapper } from "@core/dto-mapper/implementation/cart.mapper";
import { Provider } from "@nestjs/common";

export const cartServiceProvider: Provider[] = [
    {
        provide: CART_SERVICE_NAME,
        useClass: CartService
    },
    {
        provide: CART_MAPPER,
        useClass: CartMapper
    }
];
