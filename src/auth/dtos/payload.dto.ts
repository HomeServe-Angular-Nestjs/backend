export interface IPayload {
    id?: string;
    email: string;
    username?: string;
    type: 'customer' | 'provider';
}