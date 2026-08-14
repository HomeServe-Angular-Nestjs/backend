import { IReportMapper } from '@core/dto-mapper/interface/report.mapper.interface';
import { Report } from '@core/entities/implementation/report.entity';
import { IReport } from '@core/entities/interfaces/report.entity.interface';
import { ReportDocument } from '@core/schema/report.schema';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ReportMapper implements IReportMapper {
  toDocument(entity: Partial<IReport>): Partial<ReportDocument> {
    return {
      reportedId: new Types.ObjectId(entity.reportedId),
      targetId: new Types.ObjectId(entity.targetId),
      type: entity.type,
      reason: entity.reason,
      description: entity.description,
      status: entity.status,
      investigationNotes: entity.investigationNotes,
      resolutionNote: entity.resolutionNote,
      resolvedAt: entity.resolvedAt ? new Date(entity.resolvedAt) : undefined,
    };
  }

  toEntity(doc: Partial<ReportDocument>): IReport {
    return new Report({
      id: (doc._id as Types.ObjectId).toString(),
      reportedId: String(doc.reportedId),
      targetId: String(doc.targetId),
      type: doc.type,
      reason: doc.reason,
      description: doc.description,
      status: doc.status,
      investigationNotes: doc.investigationNotes,
      resolutionNote: doc.resolutionNote,
      resolvedAt: doc.resolvedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
