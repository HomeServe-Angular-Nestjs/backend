import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PDF_SERVICE } from '@core/constants/service.constant';

@Module({
    providers: [
        PdfService,
        {
            provide: PDF_SERVICE,
            useClass: PdfService
        } 
    ],
    exports: [PdfService, PDF_SERVICE],
})
export class PdfModule { }