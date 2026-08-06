import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { REPORT_MODEL_NAME } from "@core/constants/model.constant";
import { BaseRepository } from "@core/repositories/base/implementations/base.repository";
import { IReportRepository } from "@core/repositories/interfaces/report-repo.interface";
import { ReportDocument } from "@core/schema/report.schema";
import { IDisputeAnalyticsRaw, IReportFilter, IReportOverViewMatrix, IReportTargetSummary } from "@core/entities/interfaces/report.entity.interface";
import { PipelineStage } from "mongoose";
import { ComplaintReason, ReportStatus } from "@core/enum/report.enum";
import { stringify } from "node:querystring";

@Injectable()
export class ReportRepository extends BaseRepository<ReportDocument> implements IReportRepository {
    constructor(
        @InjectModel(REPORT_MODEL_NAME)
        private readonly _reportModel: Model<ReportDocument>
    ) {
        super(_reportModel);
    }

    async count(): Promise<number> {
        return await this._reportModel.countDocuments();
    }

    async fetchReports(page = 1, limit = 10, filter: IReportFilter = {}): Promise<ReportDocument[]> {
        const skip = (page - 1) * limit;
        const query: Record<string, any> = {};

        if (filter.status) query.status = filter.status;
        if (filter.type) query.type = filter.type;

        const pipeline: PipelineStage[] = [
            { $match: query },
            ...(filter.search
                ? [
                    {
                        $addFields: {
                            searchPriority: {
                                $switch: {
                                    branches: [
                                        { case: { $regexMatch: { input: { $toString: "$_id" }, regex: filter.search, options: "i" } }, then: 1 },
                                        { case: { $regexMatch: { input: { $toString: "$reportedId" }, regex: filter.search, options: "i" } }, then: 2 },
                                        { case: { $regexMatch: { input: { $toString: "$targetId" }, regex: filter.search, options: "i" } }, then: 3 },
                                    ],
                                    default: 999,
                                },
                            },
                        },
                    },
                    { $match: { searchPriority: { $lt: 999 } } },
                    { $sort: { searchPriority: 1 as 1, createdAt: -1 as -1 } },
                ]
                : [{ $sort: { createdAt: -1 as -1 } }]),
            { $skip: skip },
            { $limit: limit },
        ];

        return this._reportModel.aggregate(pipeline).exec();
    }

    async updateReportStatus(reportId: string, status: ReportStatus, resolutionNote?: string): Promise<ReportDocument | null> {
        const isTerminal = status === ReportStatus.RESOLVED || status === ReportStatus.REJECTED;
        return await this._reportModel.findByIdAndUpdate(
            reportId,
            {
                $set: {
                    status,
                    ...(resolutionNote !== undefined ? { resolutionNote } : {}),
                    ...(isTerminal ? { resolvedAt: new Date() } : {})
                }
            },
            { new: true }
        );
    }

    async updateInvestigationNotes(reportId: string, investigationNotes: string): Promise<ReportDocument | null> {
        return await this._reportModel.findByIdAndUpdate(
            reportId,
            { $set: { investigationNotes } },
            { new: true }
        );
    }

    async getTargetReportSummary(targetId: string): Promise<IReportTargetSummary> {
        const [result] = await this._reportModel.aggregate([
            { $match: { targetId: this._toObjectId(targetId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", ReportStatus.PENDING] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ["$status", ReportStatus.RESOLVED] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$status", ReportStatus.REJECTED] }, 1, 0] } }
                }
            },
            { $project: { _id: 0 } }
        ]);

        return result || { total: 0, pending: 0, resolved: 0, rejected: 0 };
    }

    async getReportOverviewDetails(): Promise<IReportOverViewMatrix> {
        let statusOverviewPipeline: PipelineStage[] = [
            {
                $group: { _id: "$status", count: { $sum: 1 } }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$count" },
                    counts: { $push: { k: "$_id", v: "$count" } }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { total: "$total" },
                            { $arrayToObject: "$counts" }
                        ]
                    }
                }
            }
        ];

        let flaggedPipeline: PipelineStage[] = [
            { $match: { status: { $nin: [ReportStatus.RESOLVED, ReportStatus.REJECTED] } } },
            { $group: { _id: "$targetId", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } },
            { $count: "flagged" }
        ]

        const [statusOverviewResult, flaggedResult] = await Promise.all([
            this._reportModel.aggregate(statusOverviewPipeline),
            this._reportModel.aggregate(flaggedPipeline)
        ]);

        return {
            ...statusOverviewResult[0],
            flagged: flaggedResult[0]?.flagged || 0
        };
    }

    async getMonthlyDisputeStats(providerId: string): Promise<IDisputeAnalyticsRaw[]> {
        return await this._reportModel.aggregate([
            { $match: { targetId: this._toObjectId(providerId) } },
            {
                $addFields: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                }
            },
            { $match: { year: new Date().getFullYear() } },
            {
                $group: {
                    _id: "$month",
                    other: {
                        $sum: {
                            $cond: [{ $eq: ["$reason", ComplaintReason.OTHER] }, 1, 0]
                        }
                    },
                    harassment: {
                        $sum: {
                            $cond: [{ $eq: ["$reason", ComplaintReason.HARASSMENT] }, 1, 0]
                        }
                    },
                    spam: {
                        $sum: {
                            $cond: [{ $eq: ["$reason", ComplaintReason.SPAM] }, 1, 0]
                        }
                    },
                    inappropriate: {
                        $sum: {
                            $cond: [{ $eq: ["$reason", ComplaintReason.INAPPROPRIATE] }, 1, 0]
                        }
                    },
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    other: 1,
                    harassment: 1,
                    spam: 1,
                    inappropriate: 1
                }
            }
        ]);
    }
}