import { COUPON_MODEL_NAME, PROFESSION_MODEL_NAME, SERVICE_CATEGORY_MODEL_NAME } from '@core/constants/model.constant';
import { COUPON_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { CouponRepository } from '@core/repositories/implementations/coupon.repository';
import type { CouponDocument } from '@core/schema/coupon.schema';
import type { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { PROFESSION_REPOSITORY_NAME, SERVICE_CATEGORY_REPOSITORY_NAME } from '@core/constants/repository.constant';
import type { ProfessionDocument } from '@core/schema/profession.schema';
import { ProfessionRepository } from '@core/repositories/implementations/profession.repository';
import type { ServiceCategoryDocument } from '@core/schema/service-category';
import { ServiceCategoryRepository } from '@core/repositories/implementations/service-category.repository';

export const couponRepositoryProviders: Provider[] = [
  {
    provide: COUPON_REPOSITORY_NAME,
    useFactory: (couponModel: Model<CouponDocument>) => new CouponRepository(couponModel),
    inject: [getModelToken(COUPON_MODEL_NAME)],
  },
  {
    provide: PROFESSION_REPOSITORY_NAME,
    useFactory: (professionModel: Model<ProfessionDocument>) => new ProfessionRepository(professionModel),
    inject: [getModelToken(PROFESSION_MODEL_NAME)],
  },
  {
    provide: SERVICE_CATEGORY_REPOSITORY_NAME,
    useFactory: (serviceCategoryModel: Model<ServiceCategoryDocument>) => new ServiceCategoryRepository(serviceCategoryModel),
    inject: [getModelToken(SERVICE_CATEGORY_MODEL_NAME)],
  },
];
