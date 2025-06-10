export interface RazorpayOrder {
    id: string;
    entity: 'order';
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: 'created' | 'attempted' | 'paid';
    attempts: number;
    created_at: number;
}

export interface IPaymentGateway {
    createOrder(amount: number, currency?: string): Promise<RazorpayOrder>;
    verifySignature(orderId: string, paymentId: string, signature: string): boolean;
}