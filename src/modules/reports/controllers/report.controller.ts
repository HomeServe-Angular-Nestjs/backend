import { REPORT_SERVICE_NAME } from "@core/constants/service.constant";
import { IReport, IReportDetail, IReportOverViewMatrix, IReportWithPagination, ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { IPayload } from "@core/misc/payload.interface";
import { IResponse } from "@core/misc/response.util";
import { isValidIdPipe } from "@core/pipes/is-valid-id.pipe";
import { ReportFilterDto, ReportStatusDto, ReportSubmitDto } from "@modules/reports/dto/report.dto";
import { IReportService } from "@modules/reports/services/interfaces/report.service.interface";
import { Body, Controller, Inject, Post, Req, Get, Query, Param, Patch } from "@nestjs/common";
import { Request } from "express";

@Controller('report')
export class ReportController {
    constructor(
        @Inject(REPORT_SERVICE_NAME)
        private readonly _reportService: IReportService,

    ) { }

    @Post('')
    async submitReport(@Req() req: Request, @Body() body: ReportSubmitDto): Promise<IResponse> {
        const user = req.user as IPayload;
        return await this._reportService.submitReport(user.sub, user.type as ReportedType, body);
    }

    @Get('')
    async fetchReports(@Query() body: ReportFilterDto): Promise<IResponse<IReportWithPagination>> {
        const { page, ...filter } = body;
        return await this._reportService.fetchReports(page, filter);
    }

    @Get('overview')
    async getReportOverviewData() {
        return await this._reportService.getReportOverviewData();
    }

    @Get(':reportId')
    async fetchOneReport(@Param('reportId', new isValidIdPipe()) reportId: string): Promise<IResponse<IReportDetail>> {
        return await this._reportService.fetchOneReport(reportId);
    }

    @Patch(':reportId/status')
    async updateReportStatus(@Param('reportId', new isValidIdPipe()) reportId: string, @Body() body: ReportStatusDto): Promise<IResponse> {
        return await this._reportService.updateReportStatus(reportId, body.status);
    }


}