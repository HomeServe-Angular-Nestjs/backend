import type { IResponse } from '@core/misc/response.util';
import type { ILandingData, ILandingSearchCategory } from '@core/entities/interfaces/landing.entity.interface';

export interface ILandingService {
  getLandingData(): Promise<IResponse<ILandingData>>;
  searchCategories(search: string): Promise<IResponse<ILandingSearchCategory[]>>;
}
