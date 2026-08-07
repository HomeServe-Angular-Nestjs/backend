import { ISalesReportBundle } from "@core/entities/interfaces/admin.entity.interface";
import { IResponse } from "@core/misc/response.util";
import { SalesReportQueryDto } from "@modules/users/dtos/sales-report.dto";

export interface IAdminSalesReportService {
    getSalesReport(filterData: SalesReportQueryDto): Promise<IResponse<ISalesReportBundle>>;
    downloadSalesReportPdf(filterData: SalesReportQueryDto): Promise<Buffer>;
    downloadSalesReportExcel(filterData: SalesReportQueryDto): Promise<Buffer>;
}
