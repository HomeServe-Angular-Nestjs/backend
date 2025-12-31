import { CART_MODEL_NAME, PROFESSION_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME } from "@core/constants/model.constant";
import { CartDocument, CartPopulatedDocument } from "@core/schema/cart.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../base/implementations/base.repository";
import { ICartRepository } from "../interfaces/cart-repo.interface";

@Injectable()
export class CartRepository extends BaseRepository<CartDocument> implements ICartRepository {
    constructor(
        @InjectModel(CART_MODEL_NAME)
        private readonly _cartModel: Model<CartDocument>
    ) {
        super(_cartModel);
    }

    async findAndPopulateByCustomerId(customerId: string): Promise<CartPopulatedDocument | null> {
        const result = await this._cartModel.aggregate([
            { $match: { customerId: this._toObjectId(customerId) } },
            {
                $lookup: {
                    from: 'providerservices',
                    localField: 'items',
                    foreignField: '_id',
                    as: 'items',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'professions',
                                localField: 'professionId',
                                foreignField: '_id',
                                as: 'professionId'
                            }
                        },
                        {
                            $lookup: {
                                from: 'servicecategories',
                                localField: 'categoryId',
                                foreignField: '_id',
                                as: 'categoryId'
                            }
                        },
                        // flatten lookups (take first element)
                        { $set: { professionId: { $first: "$professionId" } } },
                        { $set: { categoryId: { $first: "$categoryId" } } }
                    ]
                }
            }
        ]);

        return result[0] ?? null;

    }

    async clearCartByCustomerId(customerId: string): Promise<boolean> {
        const result = await this._cartModel.updateOne(
            { customerId: this._toObjectId(customerId) },
            { $set: { items: [] } }
        );

        return result.modifiedCount > 0;
    }

    async addItem(customerId: string, providerServiceId: string): Promise<boolean> {
        const result = await this._cartModel.updateOne(
            { customerId: this._toObjectId(customerId) },
            { $push: { items: this._toObjectId(providerServiceId) } },
        );

        return result.modifiedCount > 0;
    }

    async removeItem(customerId: string, providerServiceId: string): Promise<boolean> {
        const result = await this._cartModel.updateOne(
            { customerId: this._toObjectId(customerId) },
            { $pull: { items: this._toObjectId(providerServiceId) } }
        );

        return result.modifiedCount > 0;
    }

    async isExists(customerId: string): Promise<boolean> {
        const result = await this._cartModel.findOne({ customerId: this._toObjectId(customerId) });
        return !!result;
    }

    async isItemExists(customerId: string, providerServiceId: string): Promise<boolean> {
        const result = await this._cartModel.findOne({
            customerId: this._toObjectId(customerId),
            items: this._toObjectId(providerServiceId)
        });
        return !!result;
    }
}
