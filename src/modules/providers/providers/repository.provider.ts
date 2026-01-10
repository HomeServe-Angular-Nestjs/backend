import {
  BOOKINGS_MODEL_NAME,
  CART_MODEL_NAME,
  CUSTOMER_MODEL_NAME, DATE_OVERRIDE_MODEL_NAME, PROVIDER_MODEL_NAME, PROVIDER_SERVICE_MODEL_NAME, REPORT_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME,
  SLOT_RULE_MODEL_NAME,
  WEEKLY_AVAILABILITY_MODEL_NAME
} from '@core/constants/model.constant';

import {
  BOOKING_REPOSITORY_NAME,
  CART_REPOSITORY_NAME,
  CUSTOMER_REPOSITORY_INTERFACE_NAME, DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
  PROVIDER_SERVICE_REPOSITORY_NAME,
  REPORT_REPOSITORY_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
  SLOT_RULE_REPOSITORY_NAME,
  WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME
} from '@core/constants/repository.constant';

import { Model } from 'mongoose';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import { ServiceOfferedRepository } from '@core/repositories/implementations/serviceOffered.repository';
import { CustomerDocument } from '@core/schema/customer.schema';
import { ProviderDocument } from '@core/schema/provider.schema';
import { ServiceDocument } from '@core/schema/service.schema';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BookingDocument } from '@core/schema/bookings.schema';
import { BookingRepository } from '@core/repositories/implementations/bookings.repository';
import { ReportDocument } from '@core/schema/report.schema';
import { ReportRepository } from '@core/repositories/implementations/report.repository';
import { SlotRuleDocument } from '@core/schema/slot-rule.schema';
import { SlotRuleRepository } from '@core/repositories/implementations/slot-rule.repository';
import { WeeklyAvailabilityDocument } from '@core/schema/weekly-availability.schema';
import { WeeklyAvailabilityRepository } from '@core/repositories/implementations/weekly-availability.repository';
import { DateOverridesRepository } from '@core/repositories/implementations/date-overrides.repository';
import { DateOverrideDocument } from '@core/schema/date-overrides.schema';
import { ProviderServiceDocument } from '@core/schema/provider-service.schema';
import { ProviderServiceRepository } from '@core/repositories/implementations/provider-service.repository';
import { CartDocument } from '@core/schema/cart.schema';
import { CartRepository } from '@core/repositories/implementations/cart.repository';

export const repositoryProviders: Provider[] = [
  {
    provide: CART_REPOSITORY_NAME,
    useFactory: (cartModel: Model<CartDocument>) =>
      new CartRepository(cartModel),
    inject: [getModelToken(CART_MODEL_NAME)],
  },
  {
    provide: PROVIDER_SERVICE_REPOSITORY_NAME,
    useFactory: (providerServiceModel: Model<ProviderServiceDocument>) =>
      new ProviderServiceRepository(providerServiceModel),
    inject: [getModelToken(PROVIDER_SERVICE_MODEL_NAME)],
  },
  {
    provide: DATE_OVERRIDES_REPOSITORY_INTERFACE_NAME,
    useFactory: (dateOverridesModel: Model<DateOverrideDocument>) =>
      new DateOverridesRepository(dateOverridesModel),
    inject: [getModelToken(DATE_OVERRIDE_MODEL_NAME)],
  },
  {
    provide: WEEKLY_AVAILABILITY_REPOSITORY_INTERFACE_NAME,
    useFactory: (weeklyAvailabilityModel: Model<WeeklyAvailabilityDocument>) =>
      new WeeklyAvailabilityRepository(weeklyAvailabilityModel),
    inject: [getModelToken(WEEKLY_AVAILABILITY_MODEL_NAME)],
  },
  {
    provide: PROVIDER_REPOSITORY_INTERFACE_NAME,
    useFactory: (providerModel: Model<ProviderDocument>) =>
      new ProviderRepository(providerModel),
    inject: [getModelToken(PROVIDER_MODEL_NAME)],
  },
  {
    provide: SERVICE_OFFERED_REPOSITORY_NAME,
    useFactory: (serviceOfferedModel: Model<ServiceDocument>) =>
      new ServiceOfferedRepository(serviceOfferedModel),
    inject: [getModelToken(SERVICE_OFFERED_MODEL_NAME)],
  },
  {
    provide: CUSTOMER_REPOSITORY_INTERFACE_NAME,
    useFactory: (customerModel: Model<CustomerDocument>) =>
      new CustomerRepository(customerModel),
    inject: [getModelToken(CUSTOMER_MODEL_NAME)],
  },
  {
    provide: BOOKING_REPOSITORY_NAME,
    useFactory: (bookingModel: Model<BookingDocument>) =>
      new BookingRepository(bookingModel),
    inject: [getModelToken(BOOKINGS_MODEL_NAME)]
  },
  {
    provide: REPORT_REPOSITORY_NAME,
    useFactory: (reportModel: Model<ReportDocument>) =>
      new ReportRepository(reportModel),
    inject: [getModelToken(REPORT_MODEL_NAME)]
  },
  {
    provide: SLOT_RULE_REPOSITORY_NAME,
    useFactory: (ruleModel: Model<SlotRuleDocument>) =>
      new SlotRuleRepository(ruleModel),
    inject: [getModelToken(SLOT_RULE_MODEL_NAME)]
  }
];
