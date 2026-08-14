import { RevenueChartView } from '@core/entities/interfaces/booking.entity.interface';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class RevenueChartViewDto {
  @IsOptional()
  @IsString()
  @IsIn(['monthly', 'quarterly', 'yearly'])
  view: RevenueChartView = 'monthly';
}
