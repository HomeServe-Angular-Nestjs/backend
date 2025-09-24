export interface IPricingBreakup {
    subTotal: number;
    tax: number;
    total: number;
    fee: number;
    taxRate?: number;
    feeRate?: number;
}

export interface IPricingConfig {
    taxRate: number;
}

export interface IPricingUtility {
    calculateSubtotal(prices: number[]): number;
    calculateTax(subtotal: number): Promise<number>;
    calculateFee(subtotal: number): Promise<number>;
    calculateTotal(subtotal: number, tax: number): number;
    computeBreakup(prices: number[]): Promise<IPricingBreakup>;
}