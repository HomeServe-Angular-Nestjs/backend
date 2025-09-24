import { IBookingInvoice } from "@core/entities/interfaces/booking.entity.interface";

export interface IPdfService {
    generatePdf(tableAsString: string, heading?: string): Promise<Buffer>;
    generateBookingInvoice(invoiceData: IBookingInvoice): Promise<Buffer>
}