import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomerDocument } from '../../schema/customer.schema';
import { Customer } from '../../entities/implementation/customer.entity';
import { BaseRepository } from '../base/implementations/base.repository';
import { CUSTOMER_MODEL_NAME } from '../../constants/model.constant';
import { ICustomerRepository } from '../interfaces/customer-repo.interface';
import { FilterQuery, Model, Types } from 'mongoose';
@Injectable()
export class CustomerRepository extends BaseRepository<Customer, CustomerDocument> implements ICustomerRepository {
  constructor(
    @InjectModel(CUSTOMER_MODEL_NAME)
    private _customerModel: Model<CustomerDocument>,
  ) {
    super(_customerModel);
  }

  async findByGoogleId(id: string): Promise<Customer | null> {
    const customer = await this._customerModel.findOne({ googleId: id });
    return customer ? this.toEntity(customer) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this._customerModel.findOne({ email }).exec();
    return result ? this.toEntity(result) : null;
  }

  async count(filter?: FilterQuery<CustomerDocument>): Promise<number> {
    return await this._customerModel.countDocuments(filter);
  }

  protected toEntity(doc: CustomerDocument): Customer {
    return new Customer({
      id: (doc._id as Types.ObjectId).toString(),
      email: doc.email,
      username: doc.username,
      avatar: doc.avatar,
      password: doc?.password,
      googleId: doc?.googleId,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      fullname: doc?.fullname,
      isDeleted: doc.isDeleted,
      savedProviders: doc.savedProviders
    });
  }
}
