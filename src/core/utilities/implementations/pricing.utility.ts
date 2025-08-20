import { IPricingUtility, IPricingConfig, IPricingBreakup } from "@core/utilities/interface/pricing.utility.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PricingUtility implements IPricingUtility {
    private readonly _cfg: IPricingConfig;

    constructor(cfg: IPricingConfig) {
        this._cfg = cfg;
    }

    calculateSubtotal(prices: number[]): number {
        const subtotal = prices.reduce((sum, price) => {
            if (Number.isNaN(price)) {
                throw new Error(`Invalid price detected`);
            }
            return sum + price;
        }, 0);

        return Number(subtotal.toFixed(2));
    }

    calculateTax(subtotal: number): number {
        return Number((subtotal * this._cfg.taxRate).toFixed(2));
    }

    calculateTotal(subtotal: number, tax: number): number {
        return subtotal + tax;
    }

    computeBreakup(prices: number[]): IPricingBreakup {
        const subTotal = this.calculateSubtotal(prices);
        const tax = this.calculateTax(subTotal);
        const total = this.calculateTotal(subTotal, tax);

        return {
            subTotal,
            tax,
            total,
        };
    }
}