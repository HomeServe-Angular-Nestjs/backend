import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { IPdfService } from '@core/services/pdf/pdf.interface';
import { ConfigService } from '@nestjs/config';
import * as handlebars from 'handlebars';
import { IBookingInvoice } from '@core/entities/interfaces/booking.entity.interface';

@Injectable()
export class PdfService implements IPdfService {
    private _browserInstance: puppeteer.Browser | null = null;
    private _template: string;
    private readonly _mode;

    constructor(private _configService: ConfigService) {
        this._mode = this._configService.get('NODE_ENV');
        // const templatePath = mode === 'production'
        //     ? path.join(__dirname, 'templates', 'report-template.html')
        //     : path.join(process.cwd(), 'src', 'core', 'services', 'pdf', 'templates', 'report-template.html');

        // if (!fs.existsSync(templatePath)) {
        //     throw new Error(`Template not found at path: ${templatePath}`);
        // }

        // this._template = fs.readFileSync(templatePath, 'utf8');
    }

    private async _getBrowser(): Promise<puppeteer.Browser> {
        if (!this._browserInstance) {
            this._browserInstance = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            // Handle shutdown properly
            const closeBrowser = async () => {
                if (this._browserInstance) {
                    await this._browserInstance.close();
                    this._browserInstance = null;
                }
            };
            process.on('exit', closeBrowser);
            process.on('SIGINT', closeBrowser);
            process.on('SIGTERM', closeBrowser);
        }
        return this._browserInstance;
    }

    async generatePdf(tableAsString: string, heading = 'Report'): Promise<Buffer> {
        const date = new Date().toLocaleDateString();
        const finalTemplate = this._template
            .replace('{{date}}', new Date().toLocaleString())
            .replace('{{heading}}', heading)
            .replace('{{date}}', date)
            .replace('{{tables}}', tableAsString);

        const browser = await this._getBrowser();
        const page = await browser.newPage();
        await page.setContent(finalTemplate, { waitUntil: 'networkidle0' });

        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        });

        await page.close();
        return Buffer.from(buffer);
    }

    async generateBookingInvoice(invoiceData: IBookingInvoice): Promise<Buffer> {
        const templatePath = this._mode === 'production'
            ? path.join(__dirname, 'templates', 'booking-invoice.template.html')
            : path.join(process.cwd(), 'src', 'core', 'services', 'pdf', 'templates', 'booking-invoice.template.html');

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found at path: ${templatePath}`);
        }

        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);

        const html = template({
            date: new Date().toLocaleString(),
            invoice: invoiceData
        });

        const browser = await this._getBrowser();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
        });

        await page.close();
        return Buffer.from(buffer);
    }
}
