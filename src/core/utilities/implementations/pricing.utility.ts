import { ADMIN_SETTINGS_REPOSITORY_NAME } from "@core/constants/repository.constant";
import { IAdminSettingsRepository } from "@core/repositories/interfaces/admin-settings-repo.interface";
import { IPricingUtility, IPricingBreakup } from "@core/utilities/interface/pricing.utility.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class PricingUtility implements IPricingUtility {
    private _taxRate: number;
    private _feeRate: number;

    constructor(
        @Inject(ADMIN_SETTINGS_REPOSITORY_NAME)
        private readonly _adminSettingsRepository: IAdminSettingsRepository
    ) { }

    calculateSubtotal(prices: number[]): number {
        const subtotal = prices.reduce((sum, price) => {
            if (Number.isNaN(price)) {
                throw new Error(`Invalid price detected`);
            }
            return sum + price;
        }, 0);

        return Number(subtotal.toFixed(2));
    }

    async calculateTax(subtotal: number): Promise<number> {
        const taxRate = await this._adminSettingsRepository.getTax();
        return Number((subtotal * (taxRate / 100)).toFixed(2));
    }

    async calculateFee(subtotal: number): Promise<number> {
        const feeRate = await this._adminSettingsRepository.getCustomerCommission();
        return Number((subtotal * (feeRate / 100)).toFixed(2));
    }

    calculateTotal(...values: number[]): number {
        return values.reduce((acc, val) => acc += val, 0);
    }

    async computeBreakup(prices: number[]): Promise<IPricingBreakup> {
        const subTotal = this.calculateSubtotal(prices);
        const tax = await this.calculateTax(subTotal);
        const total = this.calculateTotal(subTotal, tax);

        return {
            subTotal,
            tax,
            fee: 0,
            total,
            taxRate: await this._adminSettingsRepository.getTax(),
            feeRate: await this._adminSettingsRepository.getCustomerCommission()
        };
    }
}