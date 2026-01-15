import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put } from "@nestjs/common";
import { CART_SERVICE_NAME } from "@core/constants/service.constant";
import { ICartService } from "../services/interfaces/cart-service.interface";
import { UpdateCartItemsDto } from "@modules/cart/dtos/cart.dto";
import { User } from "@core/decorators/extract-user.decorator";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { ICartPopulated } from "@core/entities/interfaces/cart.entity.interface";

@Controller('cart')
export class CartController {
    constructor(
        @Inject(CART_SERVICE_NAME)
        private readonly _cartService: ICartService
    ) { }

    @Get('')
    async getCart(@User() user: IPayload): Promise<IResponse<ICartPopulated>> {
        return await this._cartService.getCart(user.sub);
    }

    @Patch('add')
    async addItem(@User() user: IPayload, @Body() { providerServiceId, providerId }: UpdateCartItemsDto): Promise<IResponse> {
        return await this._cartService.addItem(user.sub, providerId, providerServiceId);
    }

    @Patch('remove')
    async removeItem(@User() user: IPayload, @Body() { providerServiceId }: UpdateCartItemsDto): Promise<IResponse> {
        return await this._cartService.removeItem(user.sub, providerServiceId);
    }

    @Patch('clear')
    async clearCart(@User() user: IPayload): Promise<IResponse> {
        return await this._cartService.clearCart(user.sub);
    }
}
