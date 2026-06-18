import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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
import { Types } from "mongoose";

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
        let cartDoc = await this._cartRepository.findAndPopulateByCustomerId(customerId);
        if (!cartDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: "Cart not found"
        });

        const cart = this._cartMapper.toPopulatedEntity(cartDoc);
        cart.items = cart.items.map(item => ({
            ...item,
            image: this._uploadUtility.getSignedImageUrl(item.image)
        }));

        return {
            success: !!cart,
            message: "Cart found",
            data: cart
        };
    }

    async addItem(customerId: string, providerId: string, providerServiceId: string): Promise<IResponse<ICartPopulated>> {
        let cartDoc = await this._cartRepository.findByCustomerId(customerId);
        if (cartDoc) {
            const cart = this._cartMapper.toEntity(cartDoc);

            const itemExists = cart.items.some(item => item === providerServiceId);
            if (itemExists) {
                throw new ConflictException({
                    code: ErrorCodes.CONFLICT,
                    message: "Item already exists in cart"
                });
            }

            const isTheSameProviderInCart = await this._cartRepository.isTheSameProviderInCart(customerId, providerId);
            if (!isTheSameProviderInCart) throw new BadRequestException({
                code: ErrorCodes.BAD_REQUEST,
                message: ErrorMessage.DIFFERENT_PROVIDER_IN_CART
            });

            const isUpdated = await this._cartRepository.addItem(customerId, providerServiceId);
            if (!isUpdated) throw new InternalServerErrorException({
                code: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to add item to cart"
            });
        } else {
            cartDoc = await this._cartRepository.create(
                this._cartMapper.toDocument({
                    customerId,
                    items: [providerServiceId],
                })
            );
        }

        let updatedCartDoc = await this._cartRepository.findAndPopulateByCustomerId(customerId);
        if (!updatedCartDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: "Cart not found"
        });

        const updatedCart = this._cartMapper.toPopulatedEntity(updatedCartDoc);
        updatedCart.items = updatedCart.items.map(item => ({
            ...item,
            image: this._uploadUtility.getSignedImageUrl(item.image)
        }));

        return {
            success: true,
            message: "Item added to cart",
            data: updatedCart
        };
    }

    async removeItem(customerId: string, providerServiceId: string): Promise<IResponse> {
        const updatedCart = await this._cartRepository.removeItem(customerId, providerServiceId);

        if (!updatedCart) throw new InternalServerErrorException({
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: "Failed to remove item from cart"
        });

        let cartDoc = await this._cartRepository.findAndPopulateByCustomerId(customerId);
        if (!cartDoc) throw new NotFoundException({
            code: ErrorCodes.NOT_FOUND,
            message: "Cart not found"
        });

        const cart = this._cartMapper.toPopulatedEntity(cartDoc);
        cart.items.forEach(item => {
            item.image = this._uploadUtility.getSignedImageUrl(item.image);
        });

        return {
            success: !!updatedCart,
            message: "Item removed from cart",
            data: cart,
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
