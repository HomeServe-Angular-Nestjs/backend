import { BaseEntity } from "@core/entities/base/implementation/base.entity";
import { IReport, ReportedType } from "@core/entities/interfaces/report.entity.interface";
import { ReportStatus } from "@core/enum/report.enum";

export class Report extends BaseEntity implements IReport {
    reportedId: string;
    targetId: string;
    type: ReportedType;
    reason: string;
    description: string;
    status: ReportStatus;

    constructor(partials: Partial<IReport>) {
        super(partials);
        Object.assign(this, partials);
    }
}