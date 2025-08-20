import { FilterQuery, Model, PipelineStage } from 'mongoose';

import { CUSTOMER_MODEL_NAME } from '@core/constants/model.constant';
import { IReportUserData, IReportDownloadUserData, IStats } from '@core/entities/interfaces/admin.entity.interface';
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

  async changeReviewStatus(id: string, status: boolean): Promise<void> {
    await this._customerModel.updateOne(
      { _id: id },
      { $set: { isReviewed: status } }
    );
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

  generateCustomersReport(data: Partial<IReportDownloadUserData>): Promise<IReportUserData[]> {
    const pipeline: PipelineStage[] = [];

    const match: FilterQuery<CustomerDocument> = { isDeleted: false };

    if (data.fromDate && data.toDate) {
      match.createdAt = {
        $gte: new Date(data.fromDate),
        $lte: new Date(data.toDate)
      };
    }

    if (data.status) {
      match.isActive = data.status.toLowerCase() === 'isActive';
    }

    // Generating $match stage.
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }


    // Generating $sort stage.
    pipeline.push({ $sort: { createdAt: -1 } });


    // Generating $project stage.
    pipeline.push(
      {
        $project: {
          id: '$_id',
          email: '$email',
          username: '$username',
          fullname: '$fullname',
          phone: '$phone',
          status: '$isActive',
          date: '$createdAt'
        }
      }
    );

    return this._customerModel.aggregate(pipeline).exec();
  }
}

