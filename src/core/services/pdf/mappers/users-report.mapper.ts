import { IReportCustomerData, IReportProviderData } from "@core/entities/interfaces/admin.entity.interface";

export interface IUserTableTemplate {
    rows: any,
    columns: string[],
    role: 'customer' | 'provider'
}

function providerReportRowMapper(data: IReportProviderData[]): string {
    return (data ?? []).map(d => {
        return `
            <tr>
                <td>${d.id}</td>
                <td>${d.email}</td>
                <td>${d.username}</td>
                <td>${d.fullname ?? '-'}</td>
                <td>${d.phone ?? '-'}</td>
                <td>${d.profession ?? '-'}</td>
                <td>${d.experience ?? '-'}</td>
                <td>${d.isCertified ? 'Certified' : '-'}</td>
                <td>${d.avgRating ?? '-'}</td>
                <td>${d.totalServiceListed}</td>
                <td>${d.totalReviews}</td>
                <td>${d.totalBookings}</td>
                <td>${d.totalEarnings}</td>
                <td>${d.totalRefunds}</td>
            </tr>
        `;
    }).join('');
}

function userReportColumnMapper(data: string[]): string {
    return (data ?? []).map(d => {
        return `
             <th>${d}</th>
        `;
    }).join('');
}


function customerReportRowMapper(data: IReportCustomerData[]): string {
    return (data ?? []).map(d => {
        return `
            <tr>
                <td>${d.id}</td>
                <td>${d.email}</td>
                <td>${d.username}</td>
                <td>${d.fullname ?? '-'}</td>
                <td>${d.phone ?? '-'}</td>
                <td>${d.status ? 'Active' : 'Blocked'}</td>
                <td>${d.totalBookings}</td>
                <td>${d.totalSpend}</td>
                <td>${d.totalRefunded}</td>
            </tr>
        `;
    }).join('');
}

export function createUserReportTableTemplate(tableData: IUserTableTemplate[]): string {
    const tables: string[] = [];

    for (let table of tableData) {
        let section = '';

        if (table.rows.length > 0) {
            if (table.role === 'customer') {
                section = `
                <table>
                    <thead>
                        <tr>
                            ${userReportColumnMapper(table.columns)}
                        </tr>
                    </thead>
                    <tbody>
                        ${customerReportRowMapper(table.rows)}
                    </tbody>
                </table>
            `;
            } else if (table.role === 'provider') {
                section = `
                <table>
                    <thead>
                        <tr>
                            ${userReportColumnMapper(table.columns)}
                        </tr>
                    </thead>
                    <tbody>
                        ${providerReportRowMapper(table.rows)}
                    </tbody>
                </table>
            `;
            }
            tables.push(section);
        }
    }

    return tables.join('<br> <br>');
}