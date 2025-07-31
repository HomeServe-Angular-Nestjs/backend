export interface IPdfService {
    generatePdf(tableAsString: string, heading?: string): Promise<Buffer>;
}