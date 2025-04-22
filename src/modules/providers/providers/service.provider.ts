import { Provider } from '@nestjs/common';
import {
  PROVIDER_SERVICES_NAME,
  SERVICE_OFFERED_SERVICE_NAME,
  TOKEN_SERVICE_NAME,
} from '../../../core/constants/service.constant';
import { ServiceFeatureService } from '../services/implementations/service.service';
import { TokenService } from '../../auth/services/implementations/token.service';
import { ProviderServices } from '../services/implementations/provider.service';

export const serviceProviders: Provider[] = [
  {
    provide: SERVICE_OFFERED_SERVICE_NAME,
    useClass: ServiceFeatureService,
  },
  {
    provide: TOKEN_SERVICE_NAME,
    useClass: TokenService,
  },
  {
    provide: PROVIDER_SERVICES_NAME,
    useClass: ProviderServices,
  },
];
