import { RevenueChartView } from "@core/entities/interfaces/booking.entity.interface";
import { IsIn, IsString } from "class-validator";

export class RevenueChartViewDto {
    @IsString()
    @IsIn(['monthly', 'quarterly', 'yearly'])
    view: RevenueChartView;
}