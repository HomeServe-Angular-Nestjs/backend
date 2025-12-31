import { Inject, Injectable } from "@nestjs/common";
import { ICart, ICartPopulated } from "@core/entities/interfaces/cart.entity.interface";
import { CartDocument, CartPopulatedDocument } from "@core/schema/cart.schema";
import { ICartMapper } from "../interface/cart-mapper.interface";
import { Types } from "mongoose";
import { Cart } from "@core/entities/implementation/cart.entity";
import { PROVIDER_SERVICE_MAPPER } from "@core/constants/mappers.constant";
import { IProviderServiceMapper } from "@core/dto-mapper/interface/provider-service.mapper.interface";

@Injectable()
export class CartMapper implements ICartMapper {
    constructor(
        @Inject(PROVIDER_SERVICE_MAPPER)
        private readonly _providerServiceMapper: IProviderServiceMapper
    ) { }

    toDocument(doc: Omit<ICart, 'id'>): Partial<CartDocument> {
        return {
            customerId: new Types.ObjectId(doc.customerId),
            items: doc.items.map(item => new Types.ObjectId(item))
        };
    }

    toEntity(doc: CartDocument): ICart {
        return new Cart({
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId.toString(),
            items: doc.items.map(item => item.toString()),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    toPopulatedEntity(doc: CartPopulatedDocument): ICartPopulated {
        return {
            id: (doc._id as Types.ObjectId).toString(),
            customerId: doc.customerId.toString(),
            items: doc.items.map(item => this._providerServiceMapper.toPopulatedEntity(item)),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
