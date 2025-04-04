import { ICustomer, IProvider } from "../common/entities/interfaces/user.entity";

export function isCustomer(user: any): user is ICustomer {
    return user && user.type === 'customer';
}

function isProvider(user: any): user is IProvider {
    return user && user.type === 'provider';
}