import { IBookingInvoice } from "@core/entities/interfaces/booking.entity.interface";
import { ISalesReportBundle } from "@core/entities/interfaces/admin.entity.interface";

export interface IPdfService {
    generatePdf(tableAsString: string, heading?: string): Promise<Buffer>;
    generateBookingInvoice(invoiceData: IBookingInvoice): Promise<Buffer>
    generateSalesReportPdf(data: { report: ISalesReportBundle; generatedAt: string; dateRangeLabel: string; }): Promise<Buffer>
}