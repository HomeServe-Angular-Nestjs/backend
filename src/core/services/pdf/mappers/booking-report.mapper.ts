import { IBookingMatrixData, IBookingReportData, IReportDownloadBookingData } from "@core/entities/interfaces/admin.entity.interface";
export interface IBookingTableTemplate {
    rows: any,
    columns: string[];
    type: 'normal' | 'single';
}

function bookingReportRowMapper(data: IBookingReportData[]): string {
    return (data ?? []).map(d => {
        return `
        <tr>
            <td>${d.bookingId}</td>
            <td>${d.customerEmail}</td>
            <td>${d.providerEmail}</td>
            <td>${d.phone}</td>
            <td>${d.totalAmount}</td>
            <td>${new Date(d.date).toLocaleString()}</td>
            <td>${d.bookingStatus}</td>
            <td>${d.paymentStatus}</td>
            <td>${d.transactionId}</td>
      </tr>
        `;
    }).join('');
}

function bookingReportColumnMapper(data: string[]): string {
    return (data ?? []).map(d => {
        return `
        <th>${d}</th>
        `;
    }).join('');
}

function bookingReportMatrixRowMapper(data: IBookingMatrixData): string {
    return `
        <td>${data.totalBookings}</td>
        <td>${data.totalSpend}</td>
        <td>${data.totalRefunded}</td>
        <td>${data.averageSpend}</td>
        <td>${data.pending}</td>
        <td>${data.confirmed}</td>
        <td>${data.cancelled}</td>
    `;
}

function bookingReportMatrixColumnMapper(data: string[]): string {
    return (data ?? []).map(d => {
        return `
            <th>${d}</th>
        `
    }).join('');
}

export function createBookingReportTableTemplate(tableData: IBookingTableTemplate[]) {
    const tables: string[] = [];

    for (let table of tableData) {
        let section = '';

        if (table.type === 'normal') {
            section = `
                <table>
                    <thead>
                        <tr>
                            ${bookingReportColumnMapper(table.columns)}
                        </tr>
                    </thead>
                    <tbody>
                        ${bookingReportRowMapper(table.rows)}
                    </tbody>
                </table>
            `;
        } else if (table.type === 'single') {
            section = `
                <table>
                    <thead>
                        <tr>
                            ${bookingReportMatrixColumnMapper(table.columns)}
                        </tr>
                    </thead>
                    <tbody>
                        ${bookingReportMatrixRowMapper(table.rows)}
                    </tbody>
                </table>
            `;
        }

        tables.push(section)
    }

    return tables.join('<br> <br>');
}