import { Inject, Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { BOOKING_REPOSITORY_NAME } from '@core/constants/repository.constant';
import { PDF_SERVICE } from '@core/constants/service.constant';
import { ISalesReportBundle } from '@core/entities/interfaces/admin.entity.interface';
import { IResponse } from '@core/misc/response.util';
import { IBookingRepository } from '@core/repositories/interfaces/bookings-repo.interface';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { SalesReportQueryDto } from '@modules/users/dtos/sales-report.dto';
import { IAdminSalesReportService } from '@modules/users/services/interfaces/admin-sales-report-service.interface';

@Injectable()
export class AdminSalesReportService implements IAdminSalesReportService {
  constructor(
    @Inject(BOOKING_REPOSITORY_NAME)
    private readonly _bookingRepository: IBookingRepository,
    @Inject(PDF_SERVICE)
    private readonly _pdfService: IPdfService,
  ) {}

  private _toFilter(dto: SalesReportQueryDto) {
    const filter: any = {};
    if (dto.fromDate) filter.fromDate = dto.fromDate;
    if (dto.toDate) filter.toDate = dto.toDate;
    if (dto.professionId) filter.professionId = dto.professionId;
    if (dto.categoryId) filter.categoryId = dto.categoryId;
    if (dto.providerId) filter.providerId = dto.providerId;
    if (dto.bookingStatus) filter.bookingStatus = dto.bookingStatus;
    return filter;
  }

  private _dateRangeLabel(from?: string, to?: string): string {
    const fmt = (d?: string) =>
      d
        ? new Date(d).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Present';
    return from || to ? `${fmt(from)} - ${fmt(to)}` : 'This Year';
  }

  async getSalesReport(filterData: SalesReportQueryDto): Promise<IResponse<ISalesReportBundle>> {
    const report = await this._bookingRepository.aggregateSalesReport(this._toFilter(filterData));
    return {
      success: true,
      message: 'Sales report fetched successfully.',
      data: report,
    };
  }

  async downloadSalesReportPdf(filterData: SalesReportQueryDto): Promise<Buffer> {
    const report = await this._bookingRepository.aggregateSalesReport(this._toFilter(filterData));
    return this._pdfService.generateSalesReportPdf({
      report,
      generatedAt: new Date().toLocaleString(),
      dateRangeLabel: this._dateRangeLabel(filterData.fromDate, filterData.toDate),
    });
  }

  async downloadSalesReportExcel(filterData: SalesReportQueryDto): Promise<Buffer> {
    const report = await this._bookingRepository.aggregateSalesReport(this._toFilter(filterData));
    return this._buildWorkbook(report);
  }

  private async _buildWorkbook(report: ISalesReportBundle): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Homeserve Admin';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 24 },
      { header: 'Value', key: 'value', width: 18 },
    ];
    summarySheet.addRow({ metric: 'Total Sales (₹)', value: report.summary.totalSales });
    summarySheet.addRow({ metric: 'Completed Sales', value: report.summary.completedSales });
    summarySheet.addRow({ metric: 'Cancelled Sales', value: report.summary.cancelledSales });
    summarySheet.addRow({ metric: 'Avg Order Value (₹)', value: report.summary.avgOrderValue });
    summarySheet.addRow({ metric: 'Avg Daily Sales (₹)', value: report.summary.avgDailySales });
    summarySheet.addRow({ metric: 'Sales Growth (%)', value: report.summary.salesGrowthPct });
    summarySheet.addRow({ metric: 'Bookings Today', value: report.bookingsSold.today });
    summarySheet.addRow({ metric: 'Bookings This Week', value: report.bookingsSold.week });
    summarySheet.addRow({ metric: 'Bookings This Month', value: report.bookingsSold.month });
    summarySheet.addRow({ metric: 'Bookings This Year', value: report.bookingsSold.year });
    summarySheet.getRow(1).font = { bold: true };

    const trendSheet = workbook.addWorksheet('Sales Trend');
    trendSheet.columns = [
      { header: 'Label', key: 'label', width: 16 },
      { header: 'Revenue (₹)', key: 'revenue', width: 18 },
      { header: 'Bookings', key: 'bookings', width: 14 },
    ];
    report.trend.forEach((t) => trendSheet.addRow(t));
    trendSheet.getRow(1).font = { bold: true };

    const professionsSheet = workbook.addWorksheet('Top Professions');
    professionsSheet.columns = [
      { header: 'Profession', key: 'name', width: 24 },
      { header: 'Bookings', key: 'bookings', width: 14 },
      { header: 'Revenue (₹)', key: 'revenue', width: 18 },
    ];
    report.professions.forEach((p) => professionsSheet.addRow(p));
    professionsSheet.getRow(1).font = { bold: true };

    const categoriesSheet = workbook.addWorksheet('Top Categories');
    categoriesSheet.columns = [
      { header: 'Category', key: 'name', width: 24 },
      { header: 'Bookings', key: 'bookings', width: 14 },
      { header: 'Revenue (₹)', key: 'revenue', width: 18 },
    ];
    report.categories.forEach((c) => categoriesSheet.addRow(c));
    categoriesSheet.getRow(1).font = { bold: true };

    const servicesSheet = workbook.addWorksheet('Top Selling Services');
    servicesSheet.columns = [
      { header: 'Service', key: 'serviceName', width: 28 },
      { header: 'Profession', key: 'profession', width: 20 },
      { header: 'Provider', key: 'providerName', width: 22 },
      { header: 'Bookings', key: 'bookings', width: 12 },
      { header: 'Revenue (₹)', key: 'revenue', width: 16 },
      { header: 'Avg Rating', key: 'avgRating', width: 12 },
    ];
    report.services.forEach((s) => servicesSheet.addRow(s));
    servicesSheet.getRow(1).font = { bold: true };

    const providersSheet = workbook.addWorksheet('Provider Performance');
    providersSheet.columns = [
      { header: 'Provider', key: 'providerName', width: 22 },
      { header: 'Completed Jobs', key: 'completedJobs', width: 16 },
      { header: 'Cancelled', key: 'cancelled', width: 12 },
      { header: 'Revenue (₹)', key: 'revenue', width: 16 },
      { header: 'Completion Rate (%)', key: 'completionRate', width: 18 },
      { header: 'Avg Rating', key: 'avgRating', width: 12 },
    ];
    report.providers.forEach((p) => providersSheet.addRow(p));
    providersSheet.getRow(1).font = { bold: true };

    const cancellationSheet = workbook.addWorksheet('Cancellation Analysis');
    cancellationSheet.columns = [
      { header: 'Cancelled Orders', key: 'cancelledOrders', width: 18 },
      { header: 'Cancellation Rate (%)', key: 'cancellationRate', width: 20 },
    ];
    cancellationSheet.addRow({
      cancelledOrders: report.cancellation.cancelledOrders,
      cancellationRate: report.cancellation.cancellationRate,
    });
    cancellationSheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
