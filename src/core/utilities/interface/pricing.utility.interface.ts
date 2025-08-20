export interface IPricingBreakup {
    subTotal: number;
    tax: number;
    total: number;
}

export interface IPricingConfig {
    taxRate: number;
}

export interface IPricingUtility {
    calculateSubtotal(prices: number[]): number;
    calculateTax(subtotal: number): number;
    calculateTotal(subtotal: number, tax: number): number;
    computeBreakup(prices: number[]): IPricingBreakup;
}