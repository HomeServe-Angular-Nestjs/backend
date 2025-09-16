import { REPORT_SERVICE_NAME } from "@core/constants/service.constant";
import { ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";
import { IReportService } from "@modules/reports/services/interfaces/report.service.interface";
import { Body, Controller, Inject, Post, Req } from "@nestjs/common";
import { Request } from "express";

@Controller('report')
export class ReportController {
    constructor(
        @Inject(REPORT_SERVICE_NAME)
        private readonly _reportService: IReportService,

    ) { }

    @Post('')
    async submitReport(@Req() req: Request, @Body() body: ReportSubmitDto) {
        const user = req.user as IPayload;
        return await this._reportService.submitReport(user.sub, user.type as ReportedType, body);
    }
}