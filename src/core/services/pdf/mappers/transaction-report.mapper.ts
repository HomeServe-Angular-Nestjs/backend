import { IReportTransactionData } from "@core/entities/interfaces/admin.entity.interface";

export interface ITransactionTableTemplate {
    rows: any,
    columns: string[];
    type: 'normal'
}

function transactionRowMapper(data: IReportTransactionData[]): string {
    return (data ?? []).map(d => {
        return `
            <tr>
                <td>${d.id}</td>
                <td>${d.userId}</td>
                <td>${d.email}</td>
                <td>${d.contact ?? '-'}</td>
                <td>${(Number(d.amount) / 100).toFixed(2)}</td>
                <td>${d.method}</td>
                <td>${d.transactionType}</td>
                <td>${new Date(d.date).toLocaleDateString()}</td>               
            </tr>
        `;
    }).join('');
}

function transactionColumnMapper(data: string[]): string {
    return (data ?? []).map(d => {
        return `
            <th>${d}</th>
        `
    }).join('');
}

export function createTransactionReportTableTemplate(tableData: ITransactionTableTemplate[]): string {
    const tables: string[] = [];

    for (let table of tableData) {
        let section = '';

        if (table.rows.length > 0) {
            if (table.type === 'normal') {
                section = `
                <table>
                    <thead>
                        <tr>
                            ${transactionColumnMapper(table.columns)}
                        </tr>
                    </thead>
                    <tbody>
                        ${transactionRowMapper(table.rows)}
                    </tbody>
                </table>
            `;
            }
            tables.push(section)
        }
    }
    return tables.join('<br> <br>');
}