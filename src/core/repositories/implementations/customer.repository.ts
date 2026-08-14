import { FilterQuery, Model, PipelineStage } from 'mongoose';

import { CUSTOMER_MODEL_NAME } from '@core/constants/model.constant';
import { IReportUserData, IReportDownloadUserData, IStats } from '@core/entities/interfaces/admin.entity.interface';
import { IUpdateProfileData } from '@core/entities/interfaces/user.entity.interface';
import { BaseRepository } from '@core/repositories/base/implementations/base.repository';
import { ICustomerRepository } from '@core/repositories/interfaces/customer-repo.interface';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorCodes, ErrorMessage } from '@core/enum/error.enum';

@Injectable()
export class CustomerRepository extends BaseRepository<CustomerDocument> implements ICustomerRepository {
  constructor(
    @InjectModel(CUSTOMER_MODEL_NAME)
    private readonly _customerModel: Model<CustomerDocument>,
  ) {
    super(_customerModel);
  }

  async updateGoogleId(email: string, googleId: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOneAndUpdate({ email }, { $set: { googleId, lastLogin: new Date() } }, { new: true }).lean();
  }

  async findByGoogleId(id: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOne({ googleId: id }).exec();
  }

  async findByEmail(email: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOne({ email }).exec();
  }

  async findByIds(ids: string[]): Promise<CustomerDocument[]> {
    return await this._customerModel
      .find({
        _id: { $in: ids },
      })
      .lean();
  }

  async updatePassword(email: string, hashedPassword: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOneAndUpdate({ email }, { $set: { password: hashedPassword } }, { new: true }).lean();
  }

  async count(filter?: FilterQuery<CustomerDocument>): Promise<number> {
    return await this._customerModel.countDocuments(filter);
  }

  async updateLastLogin(email: string): Promise<void> {
    await this._customerModel.updateOne({ email }, { $set: { lastLogin: new Date() } });
  }

  async changeReviewStatus(id: string, status: boolean): Promise<void> {
    await this._customerModel.updateOne({ _id: id }, { $set: { isReviewed: status } });
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
                  $and: [{ $gte: ['$lastLoggedIn', startOfToday] }, { $lte: ['$lastLoggedIn', endOfToday] }],
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
        $lte: new Date(data.toDate),
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
    pipeline.push({
      $project: {
        id: '$_id',
        email: '$email',
        username: '$username',
        fullname: '$fullname',
        phone: '$phone',
        status: '$isActive',
        date: '$createdAt',
      },
    });

    return this._customerModel.aggregate(pipeline).exec();
  }

  async updateSubscriptionId(customerId: string, subscriptionId: string): Promise<boolean> {
    const result = await this._customerModel.updateOne({ _id: customerId }, { $set: { subscriptionId } });

    return result.modifiedCount === 1;
  }

  async partialUpdate(id: string, data: Record<string, unknown>): Promise<CustomerDocument | null> {
    try {
      return await this._customerModel.findOneAndUpdate({ _id: id }, { $set: data }, { new: true }).lean();
    } catch (error) {
      throw this.mapDuplicateKeyError(error);
    }
  }

  async toggleFavorite(customerId: string, providerId: string): Promise<CustomerDocument | null> {
    const customer = await this.findById(customerId);
    const alreadySaved = customer?.savedProviders?.includes(providerId);

    const query = alreadySaved ? { $pull: { savedProviders: providerId } } : { $addToSet: { savedProviders: providerId } };

    return await this._customerModel.findOneAndUpdate({ _id: customerId }, query, { new: true }).lean();
  }

  async updatePasswordById(customerId: string, hashedPassword: string): Promise<CustomerDocument | null> {
    return await this._customerModel.findOneAndUpdate({ _id: customerId }, { $set: { password: hashedPassword } }, { new: true }).lean();
  }

  async updateAvatar(customerId: string, publicId: string): Promise<CustomerDocument | null> {
    try {
      return await this._customerModel.findOneAndUpdate({ _id: customerId }, { $set: { avatar: publicId } }, { new: true }).lean();
    } catch (error) {
      throw this.mapDuplicateKeyError(error);
    }
  }

  async updateProfile(customerId: string, data: IUpdateProfileData): Promise<CustomerDocument | null> {
    const { fullname, username, phone, address, coordinates } = data;
    const update: Record<string, string | object> = {};

    if (fullname) update.fullname = fullname;
    if (username) update.username = username;
    if (phone) update.phone = phone;
    if (address) update.address = address;
    if (coordinates) {
      update.location = {
        type: 'Point',
        coordinates,
      };
    }

    if (Object.keys(update).length === 0) return null;

    try {
      return await this._customerModel.findOneAndUpdate({ _id: customerId }, { $set: update }, { new: true }).lean();
    } catch (error) {
      throw this.mapDuplicateKeyError(error);
    }
  }

  private mapDuplicateKeyError(error: unknown): Error {
    if ((error as { code?: number })?.code === 11000) {
      return new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: ErrorMessage.USERNAME_CONFLICT_ERROR,
      });
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
