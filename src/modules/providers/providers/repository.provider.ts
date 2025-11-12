import { Model } from 'mongoose';

import {
  BOOKINGS_MODEL_NAME,
  CUSTOMER_MODEL_NAME, PROVIDER_MODEL_NAME, REPORT_MODEL_NAME, SERVICE_OFFERED_MODEL_NAME,
  SLOT_RULE_MODEL_NAME
} from '@core/constants/model.constant';
import {
  BOOKING_REPOSITORY_NAME,
  CUSTOMER_REPOSITORY_INTERFACE_NAME, PROVIDER_REPOSITORY_INTERFACE_NAME,
  REPORT_REPOSITORY_NAME,
  SERVICE_OFFERED_REPOSITORY_NAME,
  SLOT_RULE_REPOSITORY_NAME
} from '@core/constants/repository.constant';
import { CustomerRepository } from '@core/repositories/implementations/customer.repository';
import { ProviderRepository } from '@core/repositories/implementations/provider.repository';
import {
  ServiceOfferedRepository
} from '@core/repositories/implementations/serviceOffered.repository';
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

export const repositoryProviders: Provider[] = [
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
