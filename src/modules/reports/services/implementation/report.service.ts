import { REPORT_MAPPER } from "@core/constants/mappers.constant";
import { REPORT_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IReportMapper } from "@core/dto-mapper/interface/report.mapper.interface";
import { ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { ReportSubmitDto } from "@modules/reports/dto/report.dto";
import { IReportService } from "@modules/reports/services/interfaces/report.service.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ReportService implements IReportService {

    constructor(
        @Inject(REPORT_REPOSITORY_NAME)
        private readonly _reportRepository: IReportRepository,
        @Inject(REPORT_MAPPER)
        private readonly _reportMapper: IReportMapper
    ) { }

    async submitReport(reportedId: string, type: ReportedType, report: ReportSubmitDto): Promise<IResponse> {
        const reported = await this._reportRepository.create(this._reportMapper.toDocument({
            ...report,
            reportedId,
            type,
            status: 'pending',
        }));

        return {
            success: !!reported,
            message: !!reported ? 'Reported Success' : 'Failed to report'
        }
    }
}