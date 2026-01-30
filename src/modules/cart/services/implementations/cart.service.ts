import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ICartService } from "../interfaces/cart-service.interface";
import { CART_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { ICartRepository } from "@core/repositories/interfaces/cart-repo.interface";
import { CART_MAPPER } from "@core/constants/mappers.constant";
import { ICartMapper } from "@core/dto-mapper/interface/cart-mapper.interface";
import { ErrorCodes, ErrorMessage } from "@core/enum/error.enum";
import { IResponse } from "@core/misc/response.util";
import { ICartPopulated } from "@core/entities/interfaces/cart.entity.interface";
import { ILoggerFactory, LOGGER_FACTORY } from "@core/logger/interface/logger-factory.interface";
import { ICustomLogger } from "@core/logger/interface/custom-logger.interface";
import { UPLOAD_UTILITY_NAME } from "@core/constants/utility.constant";
import { IUploadsUtility } from "@core/utilities/interface/upload.utility.interface";

@Injectable()
export class CartService implements ICartService {
    private readonly logger: ICustomLogger;

    constructor(
        @Inject(CART_REPOSITORY_NAME)
        private readonly _cartRepository: ICartRepository,
        @Inject(CART_MAPPER)
        private readonly _cartMapper: ICartMapper,
        @Inject(LOGGER_FACTORY)
        private readonly _loggerFactory: ILoggerFactory,
        @Inject(UPLOAD_UTILITY_NAME)
        private readonly _uploadUtility: IUploadsUtility,
    ) {
        this.logger = this._loggerFactory.createLogger(CartService.name);
    }

    async getCart(customerId: string): Promise<IResponse<ICartPopulated>> {
        let cart = await this._cartRepository.findAndPopulateByCustomerId(customerId);

        if (!cart) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: "Cart not found"
        });


        cart.items.forEach(item => {
            item.image = this._uploadUtility.getSignedImageUrl(item.image);
        });

        return {
            success: !!cart,
            message: "Cart found",
            data: this._cartMapper.toPopulatedEntity(cart)
        };
    }

    async addItem(customerId: string, providerId: string, providerServiceId: string): Promise<IResponse<ICartPopulated>> {
        const isItemExists = await this._cartRepository.isItemExists(customerId, providerServiceId);
        if (isItemExists) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: "Item already exists in cart"
        });

        const isTheSameProviderInCart = await this._cartRepository.isTheSameProviderInCart(customerId, providerId);

        if (!isTheSameProviderInCart) throw new BadRequestException({
            code: ErrorCodes.BAD_REQUEST,
            message: ErrorMessage.DIFFERENT_PROVIDER_IN_CART
        });

        const updatedCart = await this._cartRepository.addItem(customerId, providerServiceId);
        if (!updatedCart) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to add item to cart"
        });

        const cart = await this._cartRepository.findAndPopulateByCustomerId(customerId);
        if (!cart) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to retrieve updated cart"
        });

        cart.items.forEach(item => {
            item.image = this._uploadUtility.getSignedImageUrl(item.image);
        });

        return {
            success: !!cart,
            message: "Item added to cart",
            data: this._cartMapper.toPopulatedEntity(cart)
        };
    }

    async removeItem(customerId: string, providerServiceId: string): Promise<IResponse> {
        const updatedCart = await this._cartRepository.removeItem(customerId, providerServiceId);

        if (!updatedCart) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to remove item from cart"
        });

        return {
            success: !!updatedCart,
            message: "Item removed from cart",
        };
    }

    async clearCart(customerId: string): Promise<IResponse<void>> {
        const cleared = await this._cartRepository.clearCartByCustomerId(customerId);

        if (!cleared) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to clear cart"
        });

        return {
            success: !!cleared,
            message: "Cart cleared",
        };
    }
}
