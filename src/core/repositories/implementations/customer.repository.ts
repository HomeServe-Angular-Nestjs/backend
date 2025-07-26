import { FilterQuery, Model } from 'mongoose';

import { CUSTOMER_MODEL_NAME } from '@core/constants/model.constant';
import { IStats } from '@core/entities/interfaces/admin.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class CustomerRepository extends BaseRepository<CustomerDocument> implements ICustomerRepository {
  constructor(
    @InjectModel(CUSTOMER_MODEL_NAME)
    private readonly _customerModel: Model<CustomerDocument>,
  ) {
    super(_customerModel);
  }

  async findByGoogleId(id: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOne({ googleId: id }).exec();
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOne({ email }).exec();
  }

  async count(filter?: FilterQuery<CustomerDocument>): Promise<number> {
    return await this._customerModel.countDocuments(filter);
  }

  async getCustomerStatistics(): Promise<IStats> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const result = await this._customerModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', sevenDaysAgo] }, 1, 0],
            },
          },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$lastLoggedIn', startOfToday] },
                    { $lte: ['$lastLoggedIn', endOfToday] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return result.length > 0 ? result[0] : { new: 0, total: 0, active: 0 };
  }
}
// protected toEntity(doc: CustomerDocument): Customer {
//   return new Customer({
//     id: (doc._id as Types.ObjectId).toString(),
//     email: doc.email,
//     username: doc.username,
//     avatar: doc.avatar,
//     password: doc?.password,
//     googleId: doc?.googleId,
//     isActive: doc.isActive,
//     createdAt: doc.createdAt,
//     updatedAt: doc.updatedAt,
//     fullname: doc?.fullname,
//     isDeleted: doc.isDeleted,
//     savedProviders: doc.savedProviders,
//     phone: doc.phone,
//     location: doc.location,
//     isReviewed: doc.isReviewed,
//     address: doc.address
//   });
// }
// }
